require 'rake'
require 'rake/packagetask'

PROTOTYPE_ROOT     = File.expand_path(File.dirname(__FILE__))
PROTOTYPE_SRC_DIR  = File.join(PROTOTYPE_ROOT, 'src')
PROTOTYPE_DIST_DIR = File.join(PROTOTYPE_ROOT, 'dist')
PROTOTYPE_PKG_DIR  = File.join(PROTOTYPE_ROOT, 'pkg')
PROTOTYPE_VERSION  = '1.5.1_rc4'

task :default => [:dist, :package, :clean_package_source]

task :dist do
  $:.unshift File.join(PROTOTYPE_ROOT, 'lib')
  require 'protodoc'
  
  Dir.chdir(PROTOTYPE_SRC_DIR) do
    File.open(File.join(PROTOTYPE_DIST_DIR, 'prototype.js'), 'w+') do |dist|
      dist << Protodoc::Preprocessor.new('prototype.js')
    end
  end
end

Rake::PackageTask.new('prototype', PROTOTYPE_VERSION) do |package|
  package.need_tar_gz = true
  package.package_dir = PROTOTYPE_PKG_DIR
  package.package_files.include(
    '[A-Z]*',
    'dist/prototype.js',
    'lib/**',
    'src/**',
    'test/**'
  )
end

task :test => [:dist, :test_units]

require 'test/lib/jstest'
desc "Runs all the JavaScript unit tests and collects the results"
JavaScriptTestTask.new(:test_units) do |t|
  tests_to_run     = ENV['TESTS']    && ENV['TESTS'].split(',')
  browsers_to_test = ENV['BROWSERS'] && ENV['BROWSERS'].split(',')

  t.mount("/dist")
  t.mount("/test")
  
  Dir["test/unit/*.html"].sort.each do |test_file|
    test_file = "/#{test_file}"
    test_name = test_file[/.*\/(.+?)\.html/, 1]
    t.run(test_file) unless tests_to_run && !tests_to_run.include?(test_name)
  end
  
  %w( safari firefox ie konqueror ).each do |browser|
    t.browser(browser.to_sym) unless browsers_to_test && !browsers_to_test.include?(browser)
  end
end

task :clean_package_source do
  rm_rf File.join(PROTOTYPE_PKG_DIR, "prototype-#{PROTOTYPE_VERSION}")
end
