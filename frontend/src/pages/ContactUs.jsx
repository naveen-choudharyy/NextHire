import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { name, email, subject, message } = formData;
    const emailBody = `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:nkengineeringgroup007@gmail.com?subject=${encodeURIComponent(subject || 'NextHire Enquiry')}&body=${encodeURIComponent(emailBody)}`;
    
    // Open user's email client
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="relative isolate overflow-hidden bg-dark-900 py-16 sm:py-24">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Contact <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Have questions about your resume pass, billing, or features? Reach out and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information Panel */}
          <div className="space-y-8">
            <div className="rounded-2xl bg-dark-800/40 border border-dark-700 p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <MessageSquare className="h-5 w-5 text-brand-400 mr-2" /> Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg mr-4 flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Email Address</h3>
                    <p className="text-white font-medium mt-1">nkengineeringgroup007@gmail.com</p>
                    <p className="text-xs text-gray-500">For billing queries and refund requests</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg mr-4 flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Phone & Helpline</h3>
                    <p className="text-white font-medium mt-1">+91 9257540743</p>
                    <p className="text-xs text-gray-500">Mon-Fri (10 AM to 6 PM IST)</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg mr-4 flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Registered Office Address</h3>
                    <p className="text-white font-medium mt-1 leading-relaxed">
                      NextHire Office,<br />
                      Jaipur, Rajasthan, 302001, India
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Owner / Sole Proprietor: Naveen Choudhary</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Notice */}
            <div className="rounded-2xl border border-dark-800 bg-dark-900/60 p-6 text-sm text-gray-400">
              <span className="font-semibold text-white block mb-1">Razorpay Compliance Notice</span>
              Our payment support desk handles all UPI, Card, and Netbanking refund processing directly. For dispute resolution, please raise a ticket at nkengineeringgroup007@gmail.com.
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="rounded-2xl bg-dark-800/40 border border-dark-700 p-8 backdrop-blur-md">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Thank you for contacting us. Our support agent will email you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name <span className="text-brand-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full bg-dark-950/80 border border-dark-700 focus:border-brand-500 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address <span className="text-brand-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full bg-dark-950/80 border border-dark-700 focus:border-brand-500 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 w-full bg-dark-950/80 border border-dark-700 focus:border-brand-500 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none"
                    placeholder="e.g. Payment Issue, Feature request"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Message <span className="text-brand-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 w-full bg-dark-950/80 border border-dark-700 focus:border-brand-500 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none resize-none"
                    placeholder="Describe your issue or query here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition shadow-lg shadow-brand-500/20 disabled:opacity-55"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
