import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Target, Users, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="relative isolate overflow-hidden bg-dark-900 py-16 sm:py-24">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            About <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">NextHire</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 leading-8">
            Empowering career growth through intelligent, AI-driven recruitment and resume optimization tools.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              At NextHire, we believe that every talented individual deserves a fair chance at their dream career. Traditional application processes are often gated by rigid Applicant Tracking Systems (ATS) that filter out qualified candidates based on formatting issues or keyword mismatches.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our mission is to level the playing field by providing job-seekers with state-of-the-art tools to optimize their resumes, draft compelling cover letters, and present themselves professionally through digital portfolios.
            </p>
            <div className="border-l-4 border-brand-500 pl-4 italic text-gray-400">
              "We leverage AI to translate your real-world achievements into the high-impact language recruiters want to see."
            </div>
          </div>
          <div className="bg-dark-800/40 border border-dark-700 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Our Operations</h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start">
                <Target className="h-5 w-5 text-brand-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Ownership</strong>
                  NextHire is founded, owned, and operated by Naveen Choudhary, with a registered operations team in India.
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 text-brand-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Focus Area</strong>
                  Freshers, technology developers, and professionals transitioning careers.
                </div>
              </div>
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-brand-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Secure & Trustworthy</strong>
                  End-to-end data encryption with fully integrated Razorpay checkout for secure, seamless digital payment transactions.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="border-t border-dark-800 pt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Our Core Value System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl bg-dark-800/20 border border-dark-800/60 p-6 hover:border-brand-500/30 transition-all duration-300">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg w-fit mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quality first</h3>
              <p className="text-gray-400 text-sm">
                We craft professional PDF resume structures verified against industry standards to ensure maximum ATS score outcomes.
              </p>
            </div>

            <div className="rounded-xl bg-dark-800/20 border border-dark-800/60 p-6 hover:border-brand-500/30 transition-all duration-300">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg w-fit mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Goal-Oriented AI</h3>
              <p className="text-gray-400 text-sm">
                Our AI model uses the STAR framework (Situation, Task, Action, Result) to rewrite bullets with hard numbers and achievements.
              </p>
            </div>

            <div className="rounded-xl bg-dark-800/20 border border-dark-800/60 p-6 hover:border-brand-500/30 transition-all duration-300">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg w-fit mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trust & Safety</h3>
              <p className="text-gray-400 text-sm">
                Your data is strictly confidential. We never resell your profile credentials, contact info, or resume histories to third parties.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            to="/pricing"
            className="rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-brand-600 transition"
          >
            Explore NextHire Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
