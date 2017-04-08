require 'sinatra/base'
require 'pathname'
require 'json'

class UnitTests < Sinatra::Application

  PWD = Pathname.new( File.expand_path( File.dirname(__FILE__) ) )

  UNIQUE_ASSET_STRING = Time.new.to_i

  set :root, PWD
  set :public_folder, PWD.join('static')

  # Suppress logging.
  set :logging, false
  set :server_settings, { :AccessLog => [] }

  # By default, the server is only reachable locally. We change this so that
  # we can start the server on one machine and then run tests from another.
  set :bind, '0.0.0.0'

  PATH_TO_PROTOTYPE = PWD.join('..', '..', 'dist', 'prototype.js')

  unless PATH_TO_PROTOTYPE.file?
    raise "You must run `rake dist` before starting the server."
  end

  PATH_TO_TEST_JS  = PWD.join('tests')
  PATH_TO_FIXTURES = PWD.join('fixtures')

  SUITES = []

  PATH_TO_TEST_JS.each_entry do |e|
    next if e.directory?
    basename = e.basename('.*').to_s
    next if basename.start_with?('.')
    SUITES << basename.sub('.test', '')
  end

  SUITES_WITH_VIEWS = []

  PWD.join('views', 'tests').each_entry do |e|
    next if e.directory?
    basename = e.basename('.*').to_s
    SUITES_WITH_VIEWS << basename
  end

  after do
    headers({
      'X-UA-Compatible' => 'IE=edge',
      'Cache-Control'   => 'no-cache, no-store, must-revalidate',
      'Pragma'          => 'no-cache',
      'Expires'         => '0'
    })
  end

  # The '/inspect' endpoint should be available regardless of HTTP method.
  def self.handle_inspect(url, &block)
    %w{get post put delete patch options head}.each do |verb|
      self.send(verb, url, &block)
    end
  end

  def self.get_or_post(url, &block)
    get(url, &block)
    post(url, &block)
  end

  get '/test' do
    redirect to('/test/')
  end

  get '/test/:names/' do
    redirect to("/test/#{params[:names]}")
  end

  # /test/ will run all tests;
  # /test/foo,bar will run just "foo" and "bar" tests.
  get '/test/:names?' do
    names = params[:names]
    @suites = names.nil? ? SUITES : names.split(/,/).uniq
    @unique_asset_string = UNIQUE_ASSET_STRING.to_s
    erb :tests, :locals => { :suites => @suites }
  end

  # Will read from disk each time. No server restart necessary when the
  # distributable is updated.
  get '/prototype.js' do
    content_type 'text/javascript'
    send_file PATH_TO_PROTOTYPE
  end


  # We don't put either of these in the /static directory because
  # (a) they should be more prominent in the directory structure;
  # (b) they should never, ever get cached, and we want to enforce that
  #     aggressively.
  get '/js/tests/:filename' do
    filename = params[:filename]
    path = PATH_TO_TEST_JS.join(filename)
    if path.file?
      content_type 'text/javascript'
      send_file PATH_TO_TEST_JS.join(filename)
    else
      status 404
    end
  end

  get '/fixtures/:filename' do
    filename = params[:filename]
    send_file PATH_TO_FIXTURES.join(filename)
  end


  # Routes for Ajax tests

  handle_inspect '/inspect' do
    response = {
      :headers => request_headers(request.env),
      :method  => request.request_method,
      :body    => request.body.read
    }

    content_type 'application/json'
    JSON.dump(response)
  end

  get '/response' do
    header_params = {}
    params.each do |k, v|
      v = v.gsub(/[\r\n]/, '')
      header_params[k] = v
    end
    headers(header_params)

    if params[:'Content-Type']
      content_type params[:'Content-Type'].strip
    else
      content_type 'application/json'
    end

    params[:responseBody] || ""
  end

  # Collect all the headers that were sent with a request. (This is harder than
  # it seems because of how Rack normalizes headers.)
  def request_headers(env)
    results = {}

    env.each do |k, v|
      next unless k.start_with?('HTTP_') || k == 'CONTENT_TYPE'
      key = k.sub('HTTP_', '').gsub('_', '-').downcase
      results[key] = v
    end

    results
  end


  not_found do
    "File not found."
  end


  helpers do

    def suite_has_html?(suite)
      SUITES_WITH_VIEWS.include?(suite)
    end

  end

  # run! if app_file == $0
end