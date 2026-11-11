class CreateBreadcrumbs < ActiveRecord::Migration[8.1]
  def change
    create_table :breadcrumbs, id: :uuid do |t|
      t.references :task, null: false, foreign_key: true, type: :uuid
      t.text :completed_description
      t.text :restart_description, null: false

      t.timestamps
    end
  end
end
