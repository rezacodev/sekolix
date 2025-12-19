'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function CleanContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section className="py-32 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-slate-600 font-light">
            We&apos;d love to hear from you
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-light text-slate-900 mb-4">
              Message Sent
            </h3>
            <p className="text-lg text-slate-600 font-light">
              Thank you for contacting us. We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-slate-200 focus:border-slate-900 outline-none text-lg text-slate-900 transition-all duration-300 peer"
              />
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'name' || formData.name
                    ? '-top-6 text-sm text-slate-900'
                    : 'top-4 text-lg text-slate-400'
                }`}
              >
                Your Name
              </label>
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-slate-200 focus:border-slate-900 outline-none text-lg text-slate-900 transition-all duration-300 peer"
              />
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'email' || formData.email
                    ? '-top-6 text-sm text-slate-900'
                    : 'top-4 text-lg text-slate-400'
                }`}
              >
                Email Address
              </label>
            </div>

            {/* Subject Field */}
            <div className="relative">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-slate-200 focus:border-slate-900 outline-none text-lg text-slate-900 transition-all duration-300 peer"
              />
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'subject' || formData.subject
                    ? '-top-6 text-sm text-slate-900'
                    : 'top-4 text-lg text-slate-400'
                }`}
              >
                Subject
              </label>
            </div>

            {/* Message Field */}
            <div className="relative">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
                rows={6}
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-slate-200 focus:border-slate-900 outline-none text-lg text-slate-900 transition-all duration-300 peer resize-none"
              />
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'message' || formData.message
                    ? '-top-6 text-sm text-slate-900'
                    : 'top-4 text-lg text-slate-400'
                }`}
              >
                Your Message
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                className="group w-full md:w-auto px-12 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-3 hover:gap-5"
              >
                <span className="text-sm uppercase tracking-wider font-medium">
                  Send Message
                </span>
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}
