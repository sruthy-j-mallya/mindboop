class ApplicationMailer < ActionMailer::Base
  self.delivery_job = Mailers::DeliveryJob

  layout "mailer"
end
