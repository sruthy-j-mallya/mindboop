require "rails_helper"

RSpec.describe User, type: :model do
  it "normalizes the email address" do
    expect(User.new(email_address: " Someone@Example.COM ").email_address).to eq("someone@example.com")
  end

  it "requires a unique email address" do
    create(:user, email_address: "taken@example.com")

    expect(build(:user, email_address: "TAKEN@example.com")).not_to be_valid
  end

  it "requires a password of at least 8 characters" do
    expect(build(:user, password: "short")).not_to be_valid
  end
end
