module PDoc
  module Generators
    module Html
      module Helpers
        module BaseHelper
        end
        
        module LinkHelper
        end
        
        module CodeHelper
        end
        
        module MenuHelper
          def menu(obj)
            class_names = menu_class_name(obj)
            li_class_names = obj.type == "section" ? "menu-section" : ""
            html = <<-EOS
              <div class='menu-item'>
                #{auto_link(obj, false, :class => class_names_for(obj))}
              </div>
            EOS
            unless obj.children.empty?
              html << content_tag(:ul, obj.children.map { |n|menu(n) }.join("\n"), :class => li_class_names)
            end
            content_tag(:li, html, :class => class_names)
          end
        end
      end
    end
  end
end