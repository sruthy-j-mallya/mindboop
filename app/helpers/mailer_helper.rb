# Building blocks for HTML emails. Email clients drop <style> blocks and most CSS, so every style is inline and
# layout uses tables. Colours come from the brand tokens in app/frontend/styles/tokens.css.
module MailerHelper
  COLORS = {
    background: "#f7f3ef",
    card: "#ffffff",
    border: "#dfd1cc",
    foreground: "#1f1417",
    muted: "#6b5a5d",
    purple: "#5a2855",
    purple_dark: "#3a1835",
    coral: "#f5a392",
    on_purple: "#ffffff"
  }.freeze

  FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif".freeze

  def email_color(name)
    COLORS.fetch(name)
  end

  def email_font_family
    FONT_FAMILY
  end

  def email_heading(text)
    tag.h1 text, style: "margin: 0 0 16px; font-family: #{FONT_FAMILY}; font-size: 22px; line-height: 30px; " \
                        "font-weight: 700; color: #{COLORS[:purple_dark]};"
  end

  def email_paragraph(&block)
    tag.p style: "margin: 0 0 16px; font-family: #{FONT_FAMILY}; font-size: 16px; line-height: 24px; " \
                 "color: #{COLORS[:foreground]};", &block
  end

  def email_note(&block)
    tag.p style: "margin: 0 0 12px; font-family: #{FONT_FAMILY}; font-size: 14px; line-height: 21px; " \
                 "color: #{COLORS[:muted]};", &block
  end

  def email_link(text, url)
    link_to text, url, style: "color: #{COLORS[:purple]}; text-decoration: underline;"
  end

  # A "bulletproof" button: the table cell carries the colour, so Outlook (which ignores padding and border-radius on
  # links) still shows a filled button.
  def email_button(text, url)
    render "layouts/mailer/button", text:, url:
  end

  # The link written out, for clients that strip the button or for copying into another browser.
  def email_fallback_link(url)
    email_note do
      safe_join([ "If the button doesn't work, copy this link into your browser:", tag.br,
                  link_to(url, url, style: "color: #{COLORS[:purple]}; text-decoration: underline; word-break: break-all;") ])
    end
  end
end
