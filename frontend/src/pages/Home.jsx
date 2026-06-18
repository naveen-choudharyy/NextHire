import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Award, Star, Quote } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

const Home = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      // Fallback local testimonials if backend is offline during render
      setReviews([
        { id: 1, user_name: "Naveen Kumar", rating: 5, comment: "Helped me get shortlisted at Infosys! The AI achievement rewriter is pure magic." },
        { id: 2, user_name: "Rahul Sharma", rating: 5, comment: "A absolute steal at ₹30/resume. ATS score optimizer pointed out exactly what was missing." },
        { id: 3, user_name: "Aarti Patel", rating: 5, comment: "Built my developer portfolio in 1-click. Downloaded the source and hosted it on my own server easily." }
      ]);
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-dark-900">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold leading-6 text-brand-500 ring-1 ring-inset ring-brand-500/20 flex-inline items-center space-x-2">
              <Sparkles className="inline-block h-4 w-4 animate-pulse mr-1" />
              <span>AI-Powered Platform v2.0</span>
            </span>
          </div>
          
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Landed Your Dream Job with <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">NextHire</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Create ATS-friendly resumes in minutes, optimize your LinkedIn profile, draft tailored cover letters, and launch your downloadable personal portfolio site. All powered by advanced AI.
          </p>
          
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/register"
              className="rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 flex items-center space-x-1"
            >
              <span>Build My Resume</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="text-sm font-semibold leading-6 text-white hover:text-brand-400 transition-colors">
              View Plans <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Hero Banner Visual */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-xl bg-dark-800/40 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <div className="glass-premium rounded-lg p-6 w-[340px] sm:w-[460px] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-3 w-16 bg-brand-500/20 rounded-full" />
                  <div className="h-5 w-24 bg-brand-500/20 text-brand-400 text-xs font-bold rounded-full px-2 py-0.5 text-center">
                    ATS Score: 94/100
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/10 rounded" />
                  <div className="border-t border-white/5 my-4 pt-3 space-y-2">
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                    <div className="h-3 w-4/5 bg-white/5 rounded" />
                  </div>
                </div>
                {/* Floating features */}
                <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-accent-500/10 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 sm:py-32 bg-dark-950/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-400">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Power-packed career toolkit
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col rounded-2xl border border-dark-800 bg-dark-800/40 p-8">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Award className="h-6 w-6 text-brand-500" />
                  ATS-Friendly Templates
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Specifically designed structures optimized to parse cleanly through major applicant tracking engines like Workday and Taleo.</p>
                </dd>
              </div>
              
              <div className="flex flex-col rounded-2xl border border-dark-800 bg-dark-800/40 p-8">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Sparkles className="h-6 w-6 text-accent-500" />
                  Smart AI Rewrites
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Convert plain text achievements into result-driven metrics based bullet points (using the STAR formula) instantly.</p>
                </dd>
              </div>

              <div className="flex flex-col rounded-2xl border border-dark-800 bg-dark-800/40 p-8">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  1-Click Portfolio
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Generate a responsive, premium portfolio web profile or download the pure React source bundle to host on your domain.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-brand-400">Success Stories</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Chosen by ambitious freshers & developers
            </p>
          </div>
          
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="flex flex-col justify-between rounded-2xl bg-dark-800/50 p-8 ring-1 ring-white/5 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-white/5" />
                <div className="flex gap-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (rev.rating || 5) ? 'text-yellow-500 fill-current' : 'text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-6">"{rev.comment}"</p>
                <div className="border-t border-white/5 pt-4">
                  <p className="font-semibold text-white">{rev.user_name || "Naveen"}</p>
                  <p className="text-xs text-gray-500">Verified User</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simplified Pricing Callout */}
      <div className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl ring-1 ring-white/10 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none bg-dark-800/40 backdrop-blur-md">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-white">Unlock Career Success</h3>
            <p className="mt-6 text-base leading-7 text-gray-300">
              Get premium layouts, AI cover letter drafting, LinkedIn profiles, and developer portfolios. High performance ATS checks included.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-brand-400">What’s included</h4>
              <div className="h-px flex-auto bg-dark-700" />
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-300 sm:grid-cols-2">
              <li className="flex gap-x-3"><ShieldCheck className="h-6 w-5 flex-none text-brand-500" /> Professional PDF Exports</li>
              <li className="flex gap-x-3"><ShieldCheck className="h-6 w-5 flex-none text-brand-500" /> Unlimited AI achievement rewrites</li>
              <li className="flex gap-x-3"><ShieldCheck className="h-6 w-5 flex-none text-brand-500" /> Cover letter drafting tool</li>
              <li className="flex gap-x-3"><ShieldCheck className="h-6 w-5 flex-none text-brand-500" /> Dynamic 1-click Portfolios</li>
            </ul>
          </div>
          
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-dark-900/60 py-10 text-center ring-1 ring-white/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-400">Plans starting from</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-extrabold tracking-tight text-white">₹30</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-400">INR</span>
                </p>
                <Link
                  to="/pricing"
                  className="mt-10 block w-full rounded-lg bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-md hover:bg-brand-600 transition-all duration-200"
                >
                  View Details & Purchase
                </Link>
                <p className="mt-6 text-xs leading-5 text-gray-400">
                  Instant activation. Referral benefits available!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
