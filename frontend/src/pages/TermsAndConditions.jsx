import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="relative isolate overflow-hidden bg-dark-900 py-16 sm:py-24">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 bg-dark-850/40 border border-dark-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-4 border-b border-dark-700 pb-4">
          Terms & Conditions
        </h1>
        <p className="text-xs text-gray-500 mb-8">Last Updated: June 18, 2026</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using NextHire (the "Platform", "Service"), owned and operated by Naveen Choudhary ("Owner", "we", "us", or "our"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you are prohibited from using the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. User Account Registration</h2>
            <p>
              To use the resume builder, you are required to register an account by providing a valid email address and setting a password. You are responsible for safeguarding your credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Pricing & Payment Flow</h2>
            <p>
              Access to core resume building features, premium template layouts, AI rewriters, and PDF downloads may require a one-time fee payment (e.g. ₹30 INR for the Resume Builder Pass).
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Payments are processed securely through our integrated **Razorpay** checkout module.</li>
              <li>You agree to provide accurate, current, and complete payment card or UPI details.</li>
              <li>Once the transaction is successfully completed and verified, access to the premium features is provisioned immediately.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. User Content & License</h2>
            <p>
              You retain full ownership and intellectual property rights over any resume details, work histories, project bullet points, or profile pictures you upload. NextHire is granted a limited, non-exclusive license to host, parse, and utilize this content solely to generate PDF files and host digital portfolios as requested by you.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Upload malicious code, viruses, or script files to the system.</li>
              <li>Scrape resume templates or use automated scripts to access the Platform.</li>
              <li>Create duplicate fake accounts to bypass referrals or limits.</li>
              <li>Use the AI generation tool to draft offensive, toxic, or misleading content.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Limitation of Liability</h2>
            <p>
              NextHire provides the resume building service on an "as is" and "as available" basis. We do not guarantee that the optimized resumes will secure job interviews or placement. We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">7. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms & Conditions are governed by and construed in accordance with the laws of India. Any legal action or dispute arising under these terms shall be subject exclusively to the jurisdiction of the courts located in Jaipur, Rajasthan, India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these terms at any time. When we make updates, the "Last Updated" date will reflect the changes. Continued use of NextHire after modifications constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-2 border-t border-dark-800 pt-6">
            <p>
              If you have questions about these Terms, please contact us at **nkengineeringgroup007@gmail.com**.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
