class ConvertUsersAndSessionsToUuid < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :uuid, :uuid, null: false, default: -> { "gen_random_uuid()" }
    add_column :sessions, :uuid, :uuid, null: false, default: -> { "gen_random_uuid()" }

    add_column :sessions, :user_uuid, :uuid
    execute "UPDATE sessions SET user_uuid = users.uuid FROM users WHERE sessions.user_id = users.id"
    change_column_null :sessions, :user_uuid, false

    remove_foreign_key :sessions, :users
    remove_column :sessions, :user_id
    rename_column :sessions, :user_uuid, :user_id
    add_index :sessions, :user_id

    swap_primary_key :users
    swap_primary_key :sessions

    add_foreign_key :sessions, :users
  end

  # The original integer ids are discarded, so they can't be restored.
  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private
    def swap_primary_key(table)
      remove_column table, :id
      rename_column table, :uuid, :id
      execute "ALTER TABLE #{table} ADD PRIMARY KEY (id)"
    end
end
