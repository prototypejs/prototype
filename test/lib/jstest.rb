require 'rake/tasklib'
require 'thread'
require 'webrick'

class Browser
  def supported?; true; end
  def setup ; end
  def open(url) ; end
  def teardown ; end

  def host
    require 'rbconfig'
    Config::CONFIG['host']
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
  
  def applescript(script)
    raise "Can't run AppleScript on #{host}" unless macos?
    system "osascript -e '#{script}' 2>&1 >/dev/null"
  end
end

class FirefoxBrowser < Browser
  def initialize(path='c:\Program Files\Mozilla Firefox\firefox.exe')
    @path = path
  end

  def visit(url)
    applescript('tell application "Firefox" to Get URL "' + url + '"') if macos? 
    system("#{@path} #{url}") if windows? 
    system("firefox #{url}") if linux?
  end

  def to_s
    "Firefox"
  end
end

class SafariBrowser < Browser
  def supported?
    macos?
  end
  
  def setup
    applescript('tell application "Safari" to make new document')
  end
  
  def visit(url)
    applescript('tell application "Safari" to set URL of front document to "' + url + '"')
  end

  def teardown
    #applescript('tell application "Safari" to close front document')
  end

  def to_s
    "Safari"
  end
end

class IEBrowser < Browser
  def initialize(path='C:\Program Files\Internet Explorer\IEXPLORE.EXE')
    @path = path
  end
  
  def setup
    if windows?
      puts %{
        MAJOR ANNOYANCE on Windows.
        You have to shut down the Internet Explorer manually after each test
        for the script to proceed.
        Any suggestions on fixing this is GREATLY appreaciated!
        Thank you for your understanding.
      }
    end
  end

  def supported?
    windows?
  end
  
  def visit(url)
    system("#{@path} #{url}") if windows? 
  end

  def to_s
    "Internet Explorer"
  end
end

class KonquerorBrowser < Browser
  def supported?
    linux?
  end
  
  def visit(url)
    system("kfmclient openURL #{url}")
  end
  
  def to_s
    "Konqueror"
  end
end

# shut up, webrick :-)
class ::WEBrick::HTTPServer
  def access_log(config, req, res)
    # nop
  end
end
class ::WEBrick::BasicLog
  def log(level, data)
    # nop
  end
end

class NonCachingFileHandler < WEBrick::HTTPServlet::FileHandler
  def do_GET(req, res)
    super
    
    res['Content-Type'] = case req.path
      when /\.js$/   then 'text/javascript'
      when /\.html$/ then 'text/html'
      when /\.css$/  then 'text/css'
      else 'text/plain'
    end
    
    res['ETag'] = nil
    res['Last-Modified'] = Time.now + 100**4
    res['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    res['Pragma'] = 'no-cache'
    res['Expires'] = Time.now - 100**4
  end
end


class JavaScriptTestTask < ::Rake::TaskLib

  def initialize(name=:test)
    @name = name
    @tests = []
    @browsers = []

    @queue = Queue.new

    result = []

    @server = WEBrick::HTTPServer.new(:Port => 4711) # TODO: make port configurable
    @server.mount_proc("/results") do |req, res|
      @queue.push(req.query['result'])
      res.body = "OK"
    end
    @server.mount_proc("/content-type") do |req, res|
      res.body = req["content-type"]
    end
    
    yield self if block_given?
    define
  end

  def define
    task @name do
      trap("INT") { @server.shutdown }
      t = Thread.new { @server.start }

      # run all combinations of browsers and tests
      @browsers.each do |browser|
        if browser.supported?
          browser.setup
          @tests.each do |test|
            browser.visit("http://localhost:4711#{test}?resultsURL=http://localhost:4711/results&t=" + ("%.6f" % Time.now.to_f))
            result = @queue.pop
            puts "#{test} on #{browser}: #{result}"
          end
          browser.teardown
        else
          puts "Skipping #{browser}, not supported on this OS"
        end
        browser.teardown
      end

      @server.shutdown
      t.join
    end
  end

  def mount(path, dir=nil)
    dir = Dir.pwd + path unless dir

    # don't cache anything in our tests
    @server.mount(path, NonCachingFileHandler, dir)
  end

  # test should be specified as a url
  def run(test)
    @tests<<test
  end

  def browser(browser)
    browser =
      case(browser)
        when :firefox
          FirefoxBrowser.new
        when :safari
          SafariBrowser.new
        when :ie
          IEBrowser.new
        when :konqueror
          KonquerorBrowser.new
        else
          browser
      end

    @browsers<<browser
  end
end
