import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="relative isolate overflow-hidden bg-dark-900 py-16 sm:py-24">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 bg-dark-850/40 border border-dark-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-4 border-b border-dark-700 pb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 mb-8">Last Updated: June 18, 2026</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Introduction</h2>
            <p>
              Welcome to NextHire (the "Platform" or "Service"), owned and operated by Naveen Choudhary ("Owner", "we", "us", or "our"). We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy details how we collect, use, and protect your information when you register, visit, or buy services on NextHire.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
            <p>We collect information you provide directly to us when using our resume builder and career tools:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, password hashes, and profile settings.</li>
              <li><strong>Resume Content:</strong> Detailed education history, work experience, projects, skills, social profile links (LinkedIn, GitHub), and contact information included in your resumes.</li>
              <li><strong>Transaction & Billing Data:</strong> Payments are processed via **Razorpay**. We collect transaction status, payment UTRs, and orders. We **do not** collect or store credit card numbers, CVVs, or Netbanking passwords.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. How We Use Your Information</h2>
            <p>We use the collected information for the following business purposes:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>To build, save, edit, and format your resumes and cover letters.</li>
              <li>To compile and host your digital resume portfolios (if activated by you).</li>
              <li>To process one-time payment orders and activate purchased plans through Razorpay.</li>
              <li>To utilize AI APIs (such as OpenAI) for resume bullet rewrites and summary suggestions.</li>
              <li>To maintain compliance under regulatory guidelines and payment processor requirements.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Cookies and Session Tracking</h2>
            <p>
              We use security cookies and web storage tokens (JWTs) to authenticate your account session, keep you logged in, and remember user preferences (such as Light/Dark theme configuration). You can disable cookies in your browser settings, but some features of the builder may fail to function correctly as a result.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Data Sharing & Third-Party Processors</h2>
            <p>
              We **never** sell, trade, or rent your resume content or personal details to advertising networks or data brokers. We share details only with essential processors:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li><strong>Razorpay:</strong> To process secure transactions and credit card/UPI transactions.</li>
              <li><strong>OpenAI:</strong> To run AI-based content optimizations (such as STAR rewriter and cover letter drafts).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Security of Your Data</h2>
            <p>
              We employ standard transport layer security (HTTPS) to encrypt data in transit. Your resumes are stored on MongoDB cloud clusters with restricted access configurations. However, no digital storage system is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">7. Your Rights (Data Deletion)</h2>
            <p>
              You can view, edit, or delete any resume in your dashboard at any time. If you wish to delete your entire user profile and all associated data permanently from our servers, please contact us at **nkengineeringgroup007@gmail.com**.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">8. Contact Information</h2>
            <p>
              For questions regarding this Privacy Policy or data security practices, please contact:
              <br />
              <strong>Email:</strong> nkengineeringgroup007@gmail.com
              <br />
              <strong>Operational Address:</strong> NextHire Office, Jaipur, Rajasthan, 302001, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
