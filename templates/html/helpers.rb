module PDoc
  module Generators
    module Html
      module Helpers
        module BaseHelper
          def content_tag(tag_name, content, attributes = {})
            "<#{tag_name}#{attributes_to_html(attributes)}>#{content}</#{tag_name}>"
          end

          def img_tag(filename, attributes = {})
            attributes.merge! :src => "#{path_prefix}images/#{filename}"
            tag(:img, attributes)
          end

          def tag(tag_name, attributes = {})
            "<#{tag_name}#{attributes_to_html(attributes)} />"
          end
          
          def link_to(name, path, attributes={})
            content_tag(:a, name, attributes.merge(:href => path))
          end
          
          def htmlize(markdown)
            BlueCloth.new(markdown).to_html
          end
          
          def javascript_include_tag(*names)
            names.map do |name|
              attributes = {
                :src => "#{path_prefix}javascripts/#{name}.js",
                :type => "text/javascript",
                :charset => "utf-8"
              }
              content_tag(:script, "", attributes)
            end.join("\n")
          end

          def stylesheet_link_tag(*names)
            names.map do |name|
              attributes = {
                :href => "#{path_prefix}stylesheets/#{name}.css",
                :type => "text/css",
                :media => "screen, projection",
                :charset => "utf-8",
                :rel => "stylesheet"
              }
              tag(:link, attributes)
            end.join("\n")
          end
          
          private
            def attributes_to_html(attributes)
              attributes.map { |k, v| v ? " #{k}=\"#{v}\"" : "" }.join
            end
        end
        
        module LinkHelper
          def path_prefix
            "../" * depth
          end

          def path_to(obj)
            return path_to_section(obj) if obj.is_a?(Documentation::Section)
            path = path_prefix << [obj.section.name.downcase].concat(obj.namespace_string.downcase.split('.')).join("/")
            has_own_page?(obj) ? "#{path}/#{obj.id.downcase}.html" : "#{path}.html##{dom_id(obj)}"
          end
          
          def path_to_section(obj)
            "#{path_prefix}#{obj.id.gsub(/\s/, '_')}.html"
          end
          
          def section_from_name(name)
            root.sections.find { |section| section.name == name }
          end          

          def auto_link(obj, short = true, attributes = {})
            if obj.is_a?(String) && obj =~ /\ssection$/
              obj = section_from_name(obj.gsub(/\ssection$/, ''))
            end
            obj = root.find_by_name(obj) || obj if obj.is_a?(String)
            return nil if obj.nil?
            return obj if obj.is_a?(String)
            name = short ? obj.name : obj.full_name
            link_to(name, path_to(obj), { :title => "#{obj.full_name} (#{obj.type})" }.merge(attributes))
          end
          
          def auto_link_code(obj, short = true, attributes = {})
            return "<code>#{auto_link(obj, short, attributes)}</code>"
          end

          def auto_link_content(content)
            content.gsub!(/\[\[([a-zA-Z]+)\s+section\]\]/) do |m|
              puts; puts m; puts
              result = auto_link(section_from_name($1), false)
              puts; puts result; puts
              result
            end
            content.gsub(/\[\[([a-zA-Z$\.#]+)(?:\s+([^\]]+))?\]\]/) do |m|
              if doc_instance = root.find_by_name($1)
                $2 ? link_to($2, path_to(doc_instance)) :
                  auto_link_code(doc_instance, false)
              else
                $1
              end
            end
          end
          
          def dom_id(obj)
            "#{obj.id}-#{obj.type.gsub(/\s+/, '_')}"
          end
          
          private
            def has_own_page?(obj)
              obj.is_a?(Documentation::Namespace) || obj.is_a?(Documentation::Utility)
            end
        end
        
        module CodeHelper
          def method_synopsis(object)
            if (object.methodized?)
              return <<-EOS
                <pre class="syntax"><code class="ebnf">#{ object.signature } -&gt; #{ auto_link(object.returns, false) }
#{ object.generic_signature } -&gt; #{ auto_link(object.returns, false) }</code></pre>
                EOS
            end
            
            <<-EOS
              <pre class="syntax"><code class="ebnf">#{ object.signature } -&gt; #{ auto_link(object.returns, false) }</code></pre>
            EOS
          end
        end
        
        module MenuHelper
          def menu(obj)
            class_names = menu_class_name(obj)
            html = <<-EOS
              <div class='menu-item'>
                #{auto_link(obj, false, :class => class_names_for(obj))}
              </div>
            EOS
            unless obj.children.empty?
              html << content_tag(:ul, obj.children.map { |n|menu(n) }.join("\n"))
            end
            content_tag(:li, html, :class => class_names)
          end

          def menu_class_name(obj)
            if !doc_instance
              nil
            elsif obj == doc_instance
              "current"
            elsif obj.descendants.include?(doc_instance)
              "current-parent"
            else
              nil
            end
          end
          
          def class_names_for(obj)
            classes = [obj.type.gsub(/\s+/, '-')]
            classes << "deprecated" if obj.deprecated?
            classes.join(" ")
          end
        end
      end
    end
  end
end
