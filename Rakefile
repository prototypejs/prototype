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
  
  def self.sprocketize(path, source, destination = nil, strip_comments = true)
    require_sprockets
    secretary = Sprockets::Secretary.new(
      :root           => File.join(ROOT_DIR, path),
      :load_path      => [SRC_DIR],
      :source_files   => [source],
      :strip_comments => strip_comments
    )
    
    destination = File.join(DIST_DIR, source) unless destination
    secretary.concatenation.save_to(destination)
  end
  
  def self.build_doc_for(file)
    mkdir_p TMP_DIR
    temp_path = File.join(TMP_DIR, "prototype.temp.js")
    sprocketize('src', file, temp_path, false)
    rm_rf DOC_DIR
    
    PDoc::Runner.new(temp_path, {
      :output    => DOC_DIR,
      :templates => File.join(TEMPLATES_DIR, "html"),
      :index_page => 'README.markdown'
    }).run
    
    rm_rf temp_path
  end
  
  def self.require_sprockets
    require_submodule('sprockets', "You'll need Sprockets to build Prototype")
  end
  
  def self.require_pdoc
    require_submodule('pdoc', "You'll need PDoc to generate the documentation")
  end
  
  def self.require_unittest_js
    require_submodule('unittest_js', "You'll need UnittestJS to run the tests")
  end
  
  def self.require_caja_builder
    require_submodule('caja_builder', "You'll need CajaBuilder to run cajoled tests")
  end
  
  def self.require_submodule(submodule, message)
    message = message.strip.sub(/\.$/, '')
    begin
      require submodule
    rescue LoadError => e
      puts "\n#{message}. Just run:\n\n"
      puts "  $ git submodule init"
      puts "  $ git submodule update vendor/#{submodule}"
      puts "\nand you should be all set.\n\n"
      exit
    end
  end
end

%w[sprockets pdoc unittest_js caja_builder].each do |name|
  $:.unshift File.join(PrototypeHelper::ROOT_DIR, 'vendor', name, 'lib')
end

task :default => [:dist, :dist_helper, :package, :clean_package_source]

desc "Builds the distribution."
task :dist do
  PrototypeHelper.sprocketize("src", "prototype.js")
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
  PrototypeHelper.sprocketize("ext/update_helper", "prototype_update_helper.js")
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