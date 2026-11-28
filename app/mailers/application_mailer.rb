class ApplicationMailer < ActionMailer::Base
  LOGO_PATH = Rails.root.join("app/mailers/images/logo.png")
  SENDER_NAME = "Mindboop"

  self.delivery_job = Mailers::DeliveryJob

  default from: -> { sender }
  helper :mailer
  layout "mailer"

  before_action :attach_logo

  private
    # The configured address (MAILER_FROM in production) with any display name replaced by ours.
    def sender
      address = Mail::Address.new(ActionMailer::Base.default_params[:from]).address
      email_address_with_name(address, SENDER_NAME)
    end

    # Sent inline (CID) rather than linked, so clients that block remote images by default (Outlook) still show it.
    def attach_logo
      attachments.inline["logo.png"] = File.binread(LOGO_PATH)
    end
end
