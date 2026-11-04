module Mailers
  class DeliveryJob < ActionMailer::MailDeliveryJob
    TRANSIENT_ERRORS = [
      Resend::Error::InternalServerError,
      Resend::Error::RateLimitExceededError,
      Errno::ECONNREFUSED,
      Errno::ECONNRESET,
      Net::OpenTimeout,
      Net::ReadTimeout,
      OpenSSL::SSL::SSLError,
      SocketError
    ].freeze

    retry_on(*TRANSIENT_ERRORS, wait: :polynomially_longer, attempts: 5)
  end
end
