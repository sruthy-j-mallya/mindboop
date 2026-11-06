class CreateBreaks < ActiveRecord::Migration[8.1]
  def change
    create_table :breaks, id: :uuid do |t|
      t.references :time_log, null: false, foreign_key: true, type: :uuid, index: false
      t.string :intention, null: false
      t.integer :duration_minutes, null: false
      t.datetime :ends_at, null: false
      t.datetime :ended_at

      t.timestamps
    end

    add_index :breaks, :time_log_id
    add_index :breaks, :time_log_id, unique: true, where: "ended_at IS NULL", name: "index_breaks_on_time_log_id_when_open"
  end
end
