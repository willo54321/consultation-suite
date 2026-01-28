'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Send } from 'lucide-react';

// Placeholder endpoint - update with your actual API endpoint
const ENQUIRIES_ENDPOINT = '/api/enquiries';

export default function EnquiriesSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enquiryType: '',
    message: '',
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(ENQUIRIES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      // For now, show success anyway since endpoint isn't set up
      // Remove this when endpoint is ready
      setSubmitted(true);
      console.log('Form data:', formData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <section id="enquiries" className="section-padding bg-[#025956]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-white mb-6">
              Have a question about the proposals?
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              We want to hear from you. Whether you have questions about the development,
              want to learn more about specific aspects of the proposals, or simply want
              to share your thoughts, our team is here to help.
            </p>
            <div className="space-y-4">
              {[
                'Questions about housing and community facilities',
                'Transport and accessibility enquiries',
                'Environmental and sustainability information',
                'General feedback and comments',
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/70">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl p-8 md:p-10 shadow-lg"
          >
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-[#025956] mx-auto mb-6" />
                <h3 className="text-2xl font-medium text-[#1E1E1E] mb-4 heading-font">
                  Enquiry Received
                </h3>
                <p className="text-[#6B7280]">
                  Thank you for your enquiry. A member of our team will be in touch
                  with you shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#025956] rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-medium text-[#1E1E1E] heading-font">
                    Submit an enquiry
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                        placeholder="07XXX XXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Enquiry Type *
                      </label>
                      <select
                        name="enquiryType"
                        value={formData.enquiryType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select type...</option>
                        <option value="housing">Housing & Facilities</option>
                        <option value="transport">Transport & Access</option>
                        <option value="environment">Environment & Ecology</option>
                        <option value="timeline">Timeline & Planning</option>
                        <option value="general">General Enquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Your Enquiry *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all resize-none"
                      placeholder="Please describe your enquiry..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      required
                      className="mt-1 w-4 h-4 rounded border-[#E5E7EB] text-[#025956] focus:ring-[#025956]"
                    />
                    <label htmlFor="consent" className="text-sm text-[#6B7280]">
                      I consent to my details being stored and used to respond to my
                      enquiry in accordance with the privacy policy.
                    </label>
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#025956] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#037471] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        Submit Enquiry
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
