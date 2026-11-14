class ParkingLotItem < ApplicationRecord
  include Discard::Model

  MAX_CONTENT_LENGTH = 1000

  normalizes :content, with: ->(content) { content.strip }

  enum :kind, { idea: "idea", question: "question", task: "task" }, prefix: true, validate: true
  # Parked until dealt with: addressed by hand, or converted into an Inbox task.
  enum :status, { parked: "parked", addressed: "addressed", converted: "converted" }, validate: true

  belongs_to :user
  belongs_to :task, optional: true

  validates :content, presence: true, length: { maximum: MAX_CONTENT_LENGTH }
  validates :task, presence: true, if: :converted?
  validates :task, absence: true, unless: :converted?

  # Adds the thought to the Inbox as a task. The lock makes a repeated request (double click, second tab) a no-op
  # instead of a second task.
  def convert_to_task!
    with_lock do
      next if converted?

      update!(status: :converted, task: user.tasks.create!(title: content))
    end
  end
end
