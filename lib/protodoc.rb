require 'erb'

class String
  def lines
    split $/
  end
  
  def strip_whitespace_at_line_ends
    lines.map {|line| line.gsub(/\s+$/, '')} * $/
  end
end

module Protodoc
  module Environment
    def include(*filenames)
      filenames.map {|filename| Preprocessor.new(filename).to_s}.join("\n")
    end
  end
  
  class Preprocessor
    include Environment
    
    def initialize(filename)
      @filename = File.expand_path(filename)
      @template = ERB.new(IO.read(@filename), nil, '%')
    end
    
    def to_s
      @template.result(binding).strip_whitespace_at_line_ends
    end
  end  
end

if __FILE__ == $0
  print Protodoc::Preprocessor.new(ARGV.first)
end
