require 'rake'
require 'rake/packagetask'
require 'yaml'

module PrototypeHelper
  ROOT_DIR      = File.expand_path(File.dirname(__FILE__))
  SRC_DIR       = File.join(ROOT_DIR, 'src')
  DIST_DIR      = File.join(ROOT_DIR, 'dist')
  DOC_DIR       = File.join(ROOT_DIR, 'doc')
  TEMPLATES_DIR = File.join(ROOT_DIR, 'templates')
  PKG_DIR       = File.join(ROOT_DIR, 'pkg')
  TEST_DIR      = File.join(ROOT_DIR, 'test')
  TEST_UNIT_DIR = File.join(TEST_DIR, 'unit')
  TMP_DIR       = File.join(TEST_UNIT_DIR, 'tmp')
  VERSION       = YAML.load(IO.read(File.join(SRC_DIR, 'constants.yml')))['PROTOTYPE_VERSION']
  
  DEFAULT_SELECTOR_ENGINE = 'sizzle'
  
  # Possible options for PDoc syntax highlighting, in order of preference.
  SYNTAX_HIGHLIGHTERS = [:pygments, :coderay, :none]

  %w[sprockets pdoc unittest_js caja_builder].each do |name|
    $:.unshift File.join(PrototypeHelper::ROOT_DIR, 'vendor', name, 'lib')
  end

  def self.has_git?
    begin
      `git --version`
      return true
    rescue Error => e
      return false
    end
  end
  
  def self.require_git
    return if has_git?
    puts "\nPrototype requires Git in order to load its dependencies."
    puts "\nMake sure you've got Git installed and in your path."
    puts "\nFor more information, visit:\n\n"
    puts "  http://book.git-scm.com/2_installing_git.html"
    exit
  end
    
  def self.sprocketize(options = {})
    options = {
      :destination    => File.join(DIST_DIR, options[:source]),
      :strip_comments => true
    }.merge(options)
    
    require_sprockets
    load_path = [SRC_DIR]
    
    if selector_path = get_selector_engine(options[:selector_engine])
      load_path << selector_path
    end
    
    secretary = Sprockets::Secretary.new(
      :root           => File.join(ROOT_DIR, options[:path]),
      :load_path      => load_path,
      :source_files   => [options[:source]],
      :strip_comments => options[:strip_comments]
    )
    
    secretary.concatenation.save_to(options[:destination])
  end
  
  def self.build_doc_for(file)
    rm_rf(DOC_DIR)
    mkdir_p(DOC_DIR)
    hash = current_head
    index_header = <<EOF
<h1 style="margin-top: 31px; height: 75px; padding: 1px 0; background: url(images/header-stripe-small.png) repeat-x;">
  <a href="http://prototypejs.org" style="padding-left: 120px;">
    <img src="images/header-logo-small.png" alt="Prototype JavaScript Framework API" />
  </a>
</h1>
EOF
    PDoc.run({
      :source_files => Dir[File.join('src', 'prototype', '**', '*.js')],
      :destination  => DOC_DIR,
      :index_page   => 'README.markdown',
      :syntax_highlighter => syntax_highlighter,
      :markdown_parser    => :bluecloth,
      :src_code_text => "View source on GitHub &rarr;",
      :src_code_href => proc { |obj|
        "https://github.com/sstephenson/prototype/blob/#{hash}/#{obj.file}#L#{obj.line_number}"
      },
      :pretty_urls => false,
      :bust_cache  => false,
      :name => 'Prototype JavaScript Framework',
      :short_name => 'Prototype',
      :home_url => 'http://prototypejs.org',
      :version => PrototypeHelper::VERSION,
      :index_header => index_header,
      :footer => 'This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-Share Alike 3.0 Unported License</a>.',
      :assets => 'doc_assets'
    })
  end
  
  def self.syntax_highlighter
    if ENV['SYNTAX_HIGHLIGHTER']
      highlighter = ENV['SYNTAX_HIGHLIGHTER'].to_sym
      require_highlighter(highlighter, true)
      return highlighter
    end
    
    SYNTAX_HIGHLIGHTERS.detect { |n| require_highlighter(n) }
  end
  
  def self.require_highlighter(name, verbose=false)
    case name
    when :pygments
      success = system("pygmentize -V > /dev/null")
      if !success && verbose
        puts "\nYou asked to use Pygments, but I can't find the 'pygmentize' binary."
        puts "To install, visit:\n"
        puts "  http://pygments.org/docs/installation/\n\n"
        exit
      end
      return success # (we have pygments)
    when :coderay
      begin
        require 'coderay'
      rescue LoadError => e
        if verbose
          puts "\nYou asked to use CodeRay, but I can't find the 'coderay' gem. Just run:\n\n"
          puts "  $ gem install coderay"
          puts "\nand you should be all set.\n\n"
          exit
        end
        return false
      end
      return true # (we have CodeRay)
    when :none
      return true
    else
      puts "\nYou asked to use a syntax highlighter I don't recognize."
      puts "Valid options: #{SYNTAX_HIGHLIGHTERS.join(', ')}\n\n"
      exit
    end
  end
  
  def self.require_sprockets
    require_submodule('Sprockets', 'sprockets')
  end
  
  def self.require_pdoc
    require_submodule('PDoc', 'pdoc')
  end
  
  def self.require_unittest_js
    require_submodule('UnittestJS', 'unittest_js')
  end
  
  def self.require_caja_builder
    require_submodule('CajaBuilder', 'caja_builder')
  end
  
  def self.get_selector_engine(name)
    return if !name
    # If the submodule exists, we should use it, even if we're using the
    # default engine; the user might have fetched it manually, and thus would
    # want to build a distributable with the most recent version of that
    # engine.
    submodule_path = File.join(ROOT_DIR, "vendor", name)
    return submodule_path if File.exist?(File.join(submodule_path, "repository", ".git"))
    return submodule_path if name === "legacy_selector"
    
    # If it doesn't exist, we should fetch it, _unless_ it's the default
    # engine. We've already got a known version of the default engine in our
    # load path.
    return if name == DEFAULT_SELECTOR_ENGINE
    get_submodule('the required selector engine', "#{name}/repository")
    unless File.exist?(submodule_path)
      puts "The selector engine you required isn't available at vendor/#{name}.\n\n"
      exit
    end
  end
  
  def self.get_submodule(name, path)
    require_git
    puts "\nYou seem to be missing #{name}. Obtaining it via git...\n\n"
    
    Kernel.system("git submodule init")
    return true if Kernel.system("git submodule update vendor/#{path}")
    # If we got this far, something went wrong.
    puts "\nLooks like it didn't work. Try it manually:\n\n"
    puts "  $ git submodule init"
    puts "  $ git submodule update vendor/#{path}"
    false
  end
  
  def self.require_submodule(name, path)
    begin
      require path
    rescue LoadError => e
      # Wait until we notice that a submodule is missing before we bother the
      # user about installing git. (Maybe they brought all the files over
      # from a different machine.)
      missing_file = e.message.sub('no such file to load -- ', '')
      if missing_file == path
        # Missing a git submodule.
        retry if get_submodule(name, path)
      else
        # Missing a gem.
        puts "\nIt looks like #{name} is missing the '#{missing_file}' gem. Just run:\n\n"
        puts "  $ gem install #{missing_file}"
        puts "\nand you should be all set.\n\n"
      end
      exit
    end
  end
  
  def self.current_head
    `git show-ref --hash HEAD`.chomp[0..6]
  end
end

task :default => [:dist, :dist_helper, :package, :clean_package_source]

desc "Builds the distribution."
task :dist do
  PrototypeHelper.sprocketize(
    :path => 'src',
    :source => 'prototype.js',
    :selector_engine => ENV['SELECTOR_ENGINE'] || PrototypeHelper::DEFAULT_SELECTOR_ENGINE
  )
end

namespace :doc do
  desc "Builds the documentation."
  task :build => [:require] do
    PrototypeHelper.build_doc_for(ENV['SECTION'] ? "#{ENV['SECTION']}.js" : 'prototype.js')
  end
  
  task :require do
    PrototypeHelper.require_pdoc
  end
end

task :doc => ['doc:build']

desc "Builds the updating helper."
task :dist_helper do
  PrototypeHelper.sprocketize(:path => 'ext/update_helper', :source => 'prototype_update_helper.js')
end

Rake::PackageTask.new('prototype', PrototypeHelper::VERSION) do |package|
  package.need_tar_gz = true
  package.package_dir = PrototypeHelper::PKG_DIR
  package.package_files.include(
    '[A-Z]*',
    'dist/prototype.js',
    'lib/**',
    'src/**',
    'test/**'
  )
end

task :clean_package_source do
  rm_rf File.join(PrototypeHelper::PKG_DIR, "prototype-#{PrototypeHelper::VERSION}")
end

task :test => ['test:build', 'test:run']
namespace :test do
  desc 'Runs all the JavaScript unit tests and collects the results'
  task :run => [:require] do
    testcases        = ENV['TESTCASES']
    browsers_to_test = ENV['BROWSERS'] && ENV['BROWSERS'].split(',')
    tests_to_run     = ENV['TESTS'] && ENV['TESTS'].split(',')
    runner           = UnittestJS::WEBrickRunner::Runner.new(:test_dir => PrototypeHelper::TMP_DIR)

    Dir[File.join(PrototypeHelper::TMP_DIR, '*_test.html')].each do |file|
      file = File.basename(file)
      test = file.sub('_test.html', '')
      unless tests_to_run && !tests_to_run.include?(test)
        runner.add_test(file, testcases)
      end
    end
    
    UnittestJS::Browser::SUPPORTED.each do |browser|
      unless browsers_to_test && !browsers_to_test.include?(browser)
        runner.add_browser(browser.to_sym)
      end
    end
    
    trap('INT') { runner.teardown; exit }
    runner.run
  end
  
  task :build => [:clean, :dist] do
    builder = UnittestJS::Builder::SuiteBuilder.new({
      :input_dir  => PrototypeHelper::TEST_UNIT_DIR,
      :assets_dir => PrototypeHelper::DIST_DIR
    })
    selected_tests = (ENV['TESTS'] || '').split(',')
    builder.collect(*selected_tests)
    builder.render
  end
  
  task :clean => [:require] do
    UnittestJS::Builder.empty_dir!(PrototypeHelper::TMP_DIR)
  end
  
  task :require do
    PrototypeHelper.require_unittest_js
  end
end

task :test_units do
  puts '"rake test_units" is deprecated. Please use "rake test" instead.'
end

task :build_unit_tests do
  puts '"rake test_units" is deprecated. Please use "rake test:build" instead.'
end

task :clean_tmp do
  puts '"rake clean_tmp" is deprecated. Please use "rake test:clean" instead.'
end

namespace :caja do
  task :test => ['test:build', 'test:run']
  
  namespace :test do
    task :run => ['rake:test:run']

    task :build => [:require, 'rake:test:clean', :dist] do 
      builder = UnittestJS::CajaBuilder::SuiteBuilder.new({
        :input_dir          => PrototypeHelper::TEST_UNIT_DIR,
        :assets_dir         => PrototypeHelper::DIST_DIR,
        :whitelist_dir      => File.join(PrototypeHelper::TEST_DIR, 'unit', 'caja_whitelists'),
        :html_attrib_schema => 'html_attrib.json'
      })
      selected_tests = (ENV['TESTS'] || '').split(',')
      builder.collect(*selected_tests)
      builder.render
    end
  end
  task :require => ['rake:test:require'] do
    PrototypeHelper.require_caja_builder
  end
end