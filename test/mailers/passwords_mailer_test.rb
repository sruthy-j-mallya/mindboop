require "test_helper"

class PasswordsMailerTest < ActionMailer::TestCase
  def setup
    @user = create(:user)
    @mail = PasswordsMailer.reset(@user)
  end

  def test_that_reset_is_sent_to_the_user
    assert_equal [ @user.email_address ], @mail.to
  end

  def test_that_reset_is_sent_from_mindboop
    assert_equal "Mindboop", @mail[:from].display_names.first
    assert_equal ActionMailer::Base.default_params[:from], @mail.from.first
  end

  def test_that_reset_links_to_the_password_reset_page_in_both_parts
    link = %r{/passwords/[^/\s"]+/edit}

    assert_match link, @mail.text_part.body.to_s
    assert_match link, @mail.html_part.body.to_s
  end

  def test_that_the_html_part_shows_the_brand_logo_inline
    logo = @mail.attachments["logo.png"]

    assert_predicate logo, :inline?
    assert_includes @mail.html_part.body.to_s, %(src="#{logo.url}")
  end

  def test_that_the_html_part_uses_a_branded_button
    html = @mail.html_part.body.to_s

    assert_includes html, ">Reset password</a>"
    assert_includes html, MailerHelper::COLORS[:purple]
  end
end
