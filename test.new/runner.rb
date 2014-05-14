require 'pathname'
require 'sinatra/base'
require 'cgi'
require 'json'

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
# values should be space-separated.
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

module Runner

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
        require 'rbconfig'
        RbConfig::CONFIG['host']
      end

      def macos?
        host.include?('darwin')
      end

      def windows?
        host.include?('mswin')
      end

      def linux?
        host.include?('linux')
      end

      def visit(url)
        if windows?
          system("#{path} #{url}")
        elsif macos?
          system("open -g -a '#{path}' '#{url}'")
        elsif linux?
          system("#{name} #{url}")
        end
      end

      def installed?
        if macos?
          installed = File.exists?(path)
        else
          true # TODO
        end
      end

      def name
        n = self.class.name.split('::').last
        linux? ? n.downcase : n
      end

      def escaped_name
        name.gsub(' ', '\ ')
      end

      def path
        if macos?
          File.expand_path("/Applications/#{name}.app")
        else
          @path
        end
      end
    end

    class Firefox < Abstract

      def initialize(path=File.join(ENV['ProgramFiles'] || 'c:\Program Files', '\Mozilla Firefox\firefox.exe'))
        @path = path
      end

      def supported?
        true
      end

      def path
        if windows?
          Pathname.new('C:\Program Files').join(
            'Mozilla Firefox', 'firefox.exe')
        else
          super
        end
      end

    end

    class IE < Abstract

      def setup
        require 'win32ole' if windows?
      end

      def supported?
        windows?
      end

      def visit
        ie = WIN32OLE.new('InternetExplorer.Application')
        ie.visible = true
        ie.Navigate(url)
      end

    end

    class Safari < Abstract

      def supported?
        macos?
      end

    end

    class Chrome < Abstract

      def name
        'Google Chrome'
      end

    end

    class Opera < Abstract

      def initialize(path='C:\Program Files\Opera\Opera.exe')
        @path = path
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

    get '/results' do
      results = {
        :tests    => params[:tests].to_i,
        :passes   => params[:passes].to_i,
        :failures => params[:failures].to_i,
        :duration => params[:duration].to_f
      }

      pipe = Runner::write_pipe
      pipe.write(JSON.dump(results) + "\n")

      # We don't even need to render anything; the test page doesn't care
      # about a response.
    end
  end

  class << self

    attr_accessor :read_pipe, :write_pipe

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

      trap('INT') { exit }

      results_table = {}

      @browsers.each do |browser|
        if !browser.supported?
          puts "Skipping #{browser.name} (not supported on this OS)"
          next
        end
        if !browser.installed?
          puts "Skipping #{browser.name} (not installed on this OS)"
          next
        end
        print "Running in #{browser.name}... "

        browser.setup
        browser.visit(@url)
        browser.teardown

        message = Runner::read_pipe.gets
        results = JSON.parse(message)
        results_table[browser.name] = results

        puts "done."
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