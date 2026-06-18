import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="relative isolate overflow-hidden bg-dark-900 py-16 sm:py-24">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 bg-dark-850/40 border border-dark-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-4 border-b border-dark-700 pb-4">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-gray-500 mb-8">Last Updated: June 18, 2026</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Overview of Digital Services</h2>
            <p>
              NextHire (owned and operated by Naveen Choudhary) sells one-time access passes (such as the Resume Builder Pass for ₹30 INR). These products provide immediate, digital access to template downloads, AI credits, cover letter builders, and hosted web profiles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Refund Eligibility & Request Window</h2>
            <p>
              We want you to be completely satisfied with our career tools. If you encounter any technical issues or find that the service does not meet your professional requirements:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>You may request a full refund within **7 days** of the original payment transaction.</li>
              <li>Refund requests made after the 7-day period are generally not eligible for approval.</li>
              <li>Please include your registered email address and the Razorpay payment reference ID in your email request.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. How to Request a Refund</h2>
            <p>
              To initiate a refund, please send an email to our support helpdesk:
              <br />
              <strong>Email:</strong> nkengineeringgroup007@gmail.com
              <br />
              <strong>Subject:</strong> Refund Request - [Your Registered Email]
              <br />
              Please describe the reason for your refund request to help us improve the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Refund Processing & Timeline</h2>
            <p>
              Once your request is received, we will verify the transaction status:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Upon approval, the refund is initiated directly through **Razorpay** to your original payment method.</li>
              <li>The refund amount will be credited back to your original source (Card, UPI address, or Netbanking bank account) within **5 to 7 working days** depending on your banking provider's settlement times.</li>
              <li>No processing fees or administrative charges will be deducted from your refunded amount.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Subscription Cancellation</h2>
            <p>
              Since NextHire operates on a one-time payment model and does **not** charge recurring monthly or annual subscription fees, you do not need to cancel any active subscription plans. Your account features will remain active based on the one-time pass purchased, and you will never be charged automatically in the future.
            </p>
          </section>

          <section className="space-y-2 border-t border-dark-800 pt-6">
            <p>
              For further queries, please reach out to us at **nkengineeringgroup007@gmail.com**.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
