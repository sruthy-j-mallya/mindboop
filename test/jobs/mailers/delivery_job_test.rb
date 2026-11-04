require "test_helper"

module Mailers
  class DeliveryJobTest < ActiveJob::TestCase
    class FailingMailer < ApplicationMailer
      def fail_with(error_name)
        raise error_name.constantize.new("delivery failed")
      end
    end

    def test_that_transient_failures_are_retried
      assert_enqueued_jobs 1, only: DeliveryJob do
        job_failing_with("Net::OpenTimeout").perform_now
      end
    end

    def test_that_retries_stop_and_the_job_fails_after_the_last_attempt
      job = job_failing_with("Net::OpenTimeout")

      assert_enqueued_jobs 4, only: DeliveryJob do
        4.times { job.perform_now }
      end
      assert_raises(Net::OpenTimeout) { job.perform_now }
    end

    def test_that_permanent_failures_are_not_retried
      assert_no_enqueued_jobs do
        assert_raises(Resend::Error::InvalidRequestError) do
          job_failing_with("Resend::Error::InvalidRequestError").perform_now
        end
      end
    end

    def test_that_mailers_deliver_through_this_job
      assert_equal DeliveryJob, RegistrationsMailer.delivery_job
    end

    private

      def job_failing_with(error_name)
        DeliveryJob.new(FailingMailer.name, "fail_with", "deliver_now", args: [ error_name ])
      end
  end
end
