class AddLifeAreaToTasks < ActiveRecord::Migration[8.1]
  def change
    # Tasks without an area are in the Inbox.
    add_reference :tasks, :life_area, type: :uuid, foreign_key: { on_delete: :nullify }
  end
end
