require 'pathname'
require 'sinatra/base'
require 'cgi'
require 'json'
require 'rbconfig'
require 'yaml'

# A barebones runner for testing across multiple browsers quickly.
#
# Aims to be somewhat like the old unittest_js test runner, except that it's
# separate from the test server, and thus requires that the test server
# already be running.
#
# The fact that all unit tests can now run on one page means that we can
# simplify the test runner quite a bit. Here's what it does:
#
# 1. Based on the tests you told it to run (default: all tests), it generates
#    a URL for running those tests on the test server.
# 2. It opens that URL in each of the browsers you specified (default: all
#    browsers installed on your OS).
# 3. It spawns its own web server to listen for test results at a certain
#    URL. The test server will hit that URL with the results (tests, passes,
#    failures, duration) when the tests are done running.
# 4. It displays a summary of passes/failures in each browser.
#
# As with the old `rake test`, the `BROWSERS` and `TESTS` environment
# variables determine which browsers and tests you want to run. Multiple
# values should be comma-separated.
#
# Additionally, the test runner supports a `GREP` environment variable that
# will be passed along to Mocha. Give it a pattern (with standard regex
# syntax) and Mocha will run only the tests whose names match that pattern.
#
# USAGE
# -----
#
# rake test:run
# # (will run all tests in all browsers)
#
# rake test:run BROWSERS=safari,firefox TESTS=string,number
# # (will run string and number tests in only Safari and Firefox)
#
# rake test:run BROWSERS=chrome GREP=gsub
# # (will run all tests whose names contain "gsub" in only Chrome)

# TODO:
#
# - Figure out a better way to manage the Sinatra app. Forking is the best
#   way to separate its stdout and stderr, but that doesn't work on Windows.
# - Allow the user to specify paths to browser executables via a YAML file or
#   something. Especially crucial on Windows.
# - Get the test server to report more stuff about failures so that the
#   runner's output can be more specific about what failed and why.
#

module Runner

  host = RbConfig::CONFIG['host']
  IS_WINDOWS = host.include?('mswin') || host.include?('mingw32')

  class << self
    PWD = Pathname.new(File.dirname(__FILE__))
    CONFIG_FILE = PWD.join('browsers.yml')

    unless CONFIG_FILE.exist?
      # Copy the sample config file to an actual config file.
      sample = PWD.join('browsers.sample.yml')
      File.open(CONFIG_FILE, 'w') do |file|
        file.write( File.read(sample) )
      end
    end

    CONFIG = YAML::load_file(CONFIG_FILE)

    def config
      CONFIG
    end
  end


  module Browsers

    class Abstract

      def setup
      end

      def teardown
      end

      def supported?
        true
      end

      def host
        RbConfig::CONFIG['host']
      end

      def macos?
        host.include?('darwin')
      end

      def windows?
        host.include?('mswin') || host.include?('mingw32')
      end

      def linux?
        host.include?('linux')
      end

      def configured_path
        browsers = Runner::config['browsers']
        browsers[short_name.to_s]
      end

      def default_path
        nil
      end

      def visit(url)
        if windows?
          system(%Q["#{path}" "#{url}"])
        elsif macos?
          system("open -g -a '#{path}' '#{url}'")
        elsif linux?
          system(%Q["#{name}" "#{url}"])
        end
      end

      def installed?
        path && File.exists?(path)
      end

      def name
        n = self.class.name.split('::').last
        linux? ? n.downcase : n
      end

      def short_name
        nil
      end

      def escaped_name
        name.gsub(' ', '\ ')
      end

      def path
        if macos?
          File.expand_path("/Applications/#{name}.app")
        else
          configured_path || default_path || nil
        end
      end
    end

    class Firefox < Abstract

      def short_name
        :firefox
      end

      def default_path
        'C:\Program Files\Mozilla Firefox\firefox.exe'
      end

      def supported?
        true
      end

    end

    class IE < Abstract

      def short_name
        :ie
      end

      def setup
        require 'win32ole' if windows?
      end

      def supported?
        windows?
      end

      def installed?
        windows?
      end

      def visit(url)
        ie = WIN32OLE.new('InternetExplorer.Application')
        ie.visible = true
        ie.Navigate(url)
      end

    end

    class Safari < Abstract

      def short_name
        :safari
      end

      def supported?
        macos?
      end

    end

    class Chrome < Abstract

      def short_name
        :chrome
      end

      def default_path
        'C:\Program Files\Google\Chrome\Application\chrome.exe'
      end

      def name
        'Google Chrome'
      end

    end

    class Opera < Abstract

      def short_name
        :opera
      end

      def default_path
        'C:\Program Files\Opera\launcher.exe'
      end

    end

  end # Browsers

  BROWSERS    = {
    :ie      => Browsers::IE,
    :firefox => Browsers::Firefox,
    :chrome  => Browsers::Chrome,
    :safari  => Browsers::Safari,
    :opera   => Browsers::Opera
  }

  # A Sinatra app that listens for test results. Because we've separated the
  # runner from the test server, it listens on a different port. The test
  # page will make a JSONP call when all the tests have been run.
  class ResultsListener < Sinatra::Base
    set :port, 4568
    set :logging, false

    get '/results' do
      results = {
        "tests"    => params[:tests].to_i,
        "passes"   => params[:passes].to_i,
        "failures" => params[:failures].to_i,
        "duration" => params[:duration].to_f
      }

      if IS_WINDOWS
        Runner::queue.push(results)
      else
        pipe = Runner::write_pipe
        pipe.write(JSON.dump(results) + "\n")
      end

      # We don't even need to render anything; the test page doesn't care
      # about a response.
    end
  end

  class << self

    attr_accessor :read_pipe, :write_pipe

    def queue
      @queue ||= Queue.new
    end

    def run(browsers=nil, tests=nil, grep=nil)
      @browsers = browsers.nil? ? BROWSERS.keys :
        browsers.split(/\s*,\s*/).map(&:to_sym)
      @tests    = tests.nil? ? [] : tests.split(/\s*,\s*/).map(&:to_sym)
      @grep     = grep

      @browsers = @browsers.map { |b| get_browser(b).new }

      @url = %Q[http://127.0.0.1:4567/test/#{@tests.join(',')}?results_url=#{results_url}]

      if @grep && !@grep.nil? && !@grep.empty?
        @url << "&grep=#{CGI::escape(@grep)}"
      end

      # If we're on Linux/OS X, we want to fork off a process here, because
      # it gives us better control over stdout/stderr. But Windows doesn't
      # support forking, so we have to fall back to threads.
      if IS_WINDOWS
        thread_id = Thread.new do
          # I don't see an easy way to turn off WEBrick's annoying logging,
          # so let's just ignore it.
          $stderr = StringIO.new
          ResultsListener.run!
        end
      else
        Runner::read_pipe, Runner::write_pipe = IO.pipe

        # Start up the Sinatra app to listen for test results, but do it in a
        # fork because it sends some output to stdout and stderr that is
        # irrelevant and annoying.
        pid = fork do
          Runner::read_pipe.close
          STDOUT.reopen('/dev/null', 'w')
          STDERR.reopen('/dev/null', 'w')

          ResultsListener.run!
        end

        Runner::write_pipe.close

        # Make sure we clean up the forked process when we're done.
        at_exit do
          Process.kill(9, pid)
          Process.wait(pid)
        end
      end

      trap('INT') { exit }

      results_table = {}

      @browsers.each do |browser|
        if !browser.supported?
          puts "Skipping #{browser.name} (not supported on this OS)"
          next
        end
        if !browser.installed?
          puts "Skipping #{browser.name} (not installed on this OS)"
          puts "  (edit test/unit/browsers.yml if this is in error)"
          next
        end
        print "Running in #{browser.name}... "

        browser.setup
        browser.visit(@url)
        browser.teardown

        if IS_WINDOWS
          # On Windows we need to slow down a bit. I don't know why.
          sleep 2
          results = Runner::queue.pop
        else
          message = Runner::read_pipe.gets
          results = JSON.parse(message)
        end
        puts "done."
        results_table[browser.name] = results
      end

      puts "\n\n"

      results_table.each do |k, v|
        puts "Results for #{k}:"
        report_results(v)
      end
    end

    def results_url
      "http://127.0.0.1:4568/results"
    end

    def get_browser(name)
      BROWSERS[name]
    end

    def report_results(results)
      t, p, f, d = [
        results["tests"],
        results["passes"],
        results["failures"],
        results["duration"]
      ]

      summary = [
        "#{t} #{plural(t, 'test')}",
        "#{p} #{plural(p, 'pass', 'passes')}",
        "#{f} #{plural(f, 'failure')}"
      ]

      puts %Q[#{summary.join(', ')} in #{d} #{plural(d, 'second')}\n]
    end

    def plural(num, singular, plural=nil)
      plural = "#{singular}s" if plural.nil?
      num == 1 ? singular : plural
    end

  end

end