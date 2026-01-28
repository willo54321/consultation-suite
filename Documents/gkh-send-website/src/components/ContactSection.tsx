'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, CheckCircle } from 'lucide-react';

// Replace with your Formspree form ID from https://formspree.io
const FORMSPREE_CONTACT_ID = 'xaqqvbvb';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    postcode: '',
    message: '',
    privacy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://formspree.io/f/${FORMSPREE_CONTACT_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            postcode: formData.postcode,
            message: formData.message,
            _subject: 'Grove Heath North - Contact Form Enquiry',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <section id="contact" className="section-padding bg-[#F8F9F7]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#025956] text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Get in Touch
            </p>
            <h2 className="section-heading text-[#1E1E1E] mb-6">
              Contact us
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-10">
              We&apos;re here to answer your questions and hear your feedback about
              the Grove Heath North proposals. Get in touch using the details below
              or send us a message.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'info@groveheathnorth.co.uk',
                  href: 'mailto:info@groveheathnorth.co.uk',
                },
                {
                  icon: MapPin,
                  label: 'Exhibition - Jan 22',
                  value: 'Papercourt Sailing Club, Polesden Lane, Ripley GU23 6JX',
                  href: '#',
                },
                {
                  icon: MapPin,
                  label: 'Exhibition - Jan 24',
                  value: 'Ripley Village Hall, High Street, Ripley GU23 6AF',
                  href: '#',
                },
              ].map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={contact.label}
                    href={contact.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#025956] flex items-center justify-center flex-shrink-0 group-hover:bg-[#037471] transition-colors">
                      <Icon className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">{contact.label}</p>
                      <p className="text-[#1E1E1E] font-medium group-hover:text-[#025956] transition-colors">
                        {contact.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-lg p-8 md:p-10 shadow-sm"
          >
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-[#025956] mx-auto mb-6" />
                <h3 className="text-2xl font-light text-[#1E1E1E] mb-4">
                  Message Sent
                </h3>
                <p className="text-[#6B7280]">
                  Thank you for getting in touch. We&apos;ll respond to your enquiry as soon as possible.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-light text-[#1E1E1E] mb-6">
                  Send us a message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Postcode
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                      placeholder="AB1 2CD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all resize-none"
                      placeholder="Tell us your thoughts..."
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      checked={formData.privacy}
                      onChange={handleChange}
                      required
                      className="mt-1 w-4 h-4 rounded border-[#E5E7EB] text-[#025956] focus:ring-[#025956]"
                    />
                    <label htmlFor="privacy" className="text-sm text-[#6B7280]">
                      I agree to the privacy policy and consent to being contacted
                      about this consultation.
                    </label>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
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
