class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  # UUIDs aren't sequential, so .first and .last need a meaningful order.
  self.implicit_order_column = "created_at"
end
