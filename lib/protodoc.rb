require 'erb'

class String
  def lines
    split $/
  end
  
  def strip_whitespace_at_line_ends
    lines.map {|line| line.gsub(/\s+$/, '')} * $/
  end
  
  def strip_pdoc_comments
    gsub %r{\s*/\*\*.*?\*\*/}m, "\n"
  end
end

module Protodoc
  module Environment
    def include(*filenames)
      filenames.map do |filename|
        Preprocessor.new(expand_path(filename), @options).result
      end.join("\n")
    end
  end
  
  class Preprocessor
    include Environment
    
    def initialize(filename, options = { })
      filename = File.join(filename.split('/'))
      @filename = File.expand_path(filename)
      @template = ERB.new(IO.read(@filename), nil, '%')
      @options = options
    end
    
    def expand_path(filename)
      File.join(File.dirname(@filename), filename)
    end
    
    def result
      result = @template.result(binding)
      result = result.strip_whitespace_at_line_ends
      result = result.strip_pdoc_comments if @options[:strip_documentation]
      result
    end
    
    alias_method :to_s, :result
  end  
end

if __FILE__ == $0
  print Protodoc::Preprocessor.new(ARGV.first)
end
