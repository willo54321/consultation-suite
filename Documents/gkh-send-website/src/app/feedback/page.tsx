'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Replace with your Formspree form ID from https://formspree.io
const FORMSPREE_FEEDBACK_ID = 'mjgglolw';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    postcode: '',
    connection: '',
    support: '',
    importance: '',
    facility: '',
    facilityOther: '',
    links: '',
    transport: [] as string[],
    greenspace: '',
    tenure: '',
    furtherFeedback: '',
    updates: false,
    privacy: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(v => v !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FEEDBACK_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: 'Grove Heath North - Feedback Form Submission',
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: formData.address,
          postcode: formData.postcode,
          connection_to_area: formData.connection,
          support_for_new_homes: formData.support,
          most_important_element: formData.importance,
          community_facility: formData.facility === 'Other' ? formData.facilityOther : formData.facility,
          pedestrian_cycle_links: formData.links,
          transport_contributions: formData.transport.join(', '),
          green_space_priority: formData.greenspace,
          affordable_housing_tenure: formData.tenure,
          further_feedback: formData.furtherFeedback,
          subscribe_to_updates: formData.updates ? 'Yes' : 'No',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      setError('There was a problem submitting your feedback. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        {/* Hero Header */}
        <section className="bg-[#025956] pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to home
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="display-heading text-white"
            >
              Have Your Say
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="sub-heading text-white/70 mt-6 max-w-2xl"
            >
              Share your feedback on our proposals for Grove Heath North. Your views will help shape the plans for this development as we move towards submitting an outline planning application.
            </motion.p>
          </div>
        </section>

        {/* Feedback Form Section */}
        <section className="section-padding">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-[#025956]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-[#025956]" size={40} />
                </div>
                <h2 className="text-3xl font-medium text-[#1E1E1E] mb-4 heading-font">
                  Thank you for your feedback
                </h2>
                <p className="text-[#6B7280] text-lg mb-8">
                  Your response has been submitted successfully. We appreciate you taking the time to share your views.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-[#025956] text-white px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-[#037471] transition-all"
                >
                  Return to Home
                </Link>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Personal Details */}
                <div>
                  <h2 className="text-2xl font-medium text-[#1E1E1E] mb-6 heading-font">
                    Your Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Connection to Area */}
                <div className="pt-8 border-t border-[#E5E7EB]">
                  <h2 className="text-2xl font-medium text-[#1E1E1E] mb-6 heading-font">
                    About You
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                      What is your connection to the area? *
                    </label>
                    <div className="space-y-3">
                      {['I live in Send', 'I live in Ripley', 'I live in Burntcommon', 'I work in the area', 'I visit the area frequently'].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="connection"
                            value={option}
                            required
                            checked={formData.connection === option}
                            onChange={(e) => handleInputChange('connection', e.target.value)}
                            className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                          />
                          <span className="text-[#6B7280]">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback Questions */}
                <div className="pt-8 border-t border-[#E5E7EB]">
                  <h2 className="text-2xl font-medium text-[#1E1E1E] mb-6 heading-font">
                    Your Feedback
                  </h2>

                  <div className="space-y-8">
                    {/* Support for homes */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        Do you support the principle of bringing forward new homes and accompanying infrastructure on this site? *
                      </label>
                      <div className="space-y-3">
                        {['Yes', 'No', "I'm not sure"].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="support"
                              value={option}
                              required
                              checked={formData.support === option}
                              onChange={(e) => handleInputChange('support', e.target.value)}
                              className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Most important element */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        What element of the proposals is of most importance to you?
                      </label>
                      <div className="space-y-3">
                        {['Affordable housing provision', 'Site connectivity for pedestrians and cyclists', 'Green space provision', 'Community space provision', 'Supporting local services and infrastructure', 'Ecological enhancements'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="importance"
                              value={option}
                              checked={formData.importance === option}
                              onChange={(e) => handleInputChange('importance', e.target.value)}
                              className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Community facility */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        The development could deliver a flexible community space or small commercial unit near the site entrance. What facility would be of most use to the local community?
                      </label>
                      <div className="space-y-3">
                        {['Commercial unit', 'Flexible workspace', 'Provision of space for a nursery', 'Provision of space for a GP surgery', 'Provision of space for a dentist', 'Other'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="facility"
                              value={option}
                              checked={formData.facility === option}
                              onChange={(e) => handleInputChange('facility', e.target.value)}
                              className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                      {formData.facility === 'Other' && (
                        <input
                          type="text"
                          placeholder="Please specify..."
                          value={formData.facilityOther}
                          onChange={(e) => handleInputChange('facilityOther', e.target.value)}
                          className="w-full mt-3 px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all"
                        />
                      )}
                    </div>

                    {/* Pedestrian and cycle links */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        The proposal will improve pedestrian and cycle links. Which of the following statements do you agree with?
                      </label>
                      <div className="space-y-3">
                        {['I would be highly likely to use the new links', 'I would be likely to use the new links', 'I would be unlikely to use the new links', 'I would be very unlikely to use the new links'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="links"
                              value={option}
                              checked={formData.links === option}
                              onChange={(e) => handleInputChange('links', e.target.value)}
                              className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Transport contributions */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        There are many ways that this proposed development could contribute positively to transport infrastructure. Please select the options you would like to see the development include:
                      </label>
                      <div className="space-y-3">
                        {['Financial contributions to public transport', 'Financial contributions to highways works', 'Traffic calming on Portsmouth Road', 'A car club', 'Improved walking and cycling routes through the site'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name="transport"
                              value={option}
                              checked={formData.transport.includes(option)}
                              onChange={(e) => handleCheckboxChange('transport', option, e.target.checked)}
                              className="w-5 h-5 rounded text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Green space */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        There will be several different types of green space provided on site. What element do you consider to be the most important?
                      </label>
                      <div className="space-y-3">
                        {['Ecological enhancements', 'Suitable Alternative Natural Green Space', 'New play areas', "A 'village green' area", 'Retaining key landscape features', 'Community gardens'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="greenspace"
                              value={option}
                              checked={formData.greenspace === option}
                              onChange={(e) => handleInputChange('greenspace', e.target.value)}
                              className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Affordable housing tenure */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-3">
                        At least 50% of the homes will be affordable housing of a range of tenures. What tenure do you think is most needed in the area?
                      </label>
                      <div className="space-y-3">
                        {['Shared ownership', 'Social rent', 'Affordable rent', 'Open market sale'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="tenure"
                              value={option}
                              checked={formData.tenure === option}
                              onChange={(e) => handleInputChange('tenure', e.target.value)}
                              className="w-5 h-5 text-[#025956] focus:ring-[#025956]"
                            />
                            <span className="text-[#6B7280]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Further feedback */}
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Do you have any further feedback on the current proposals?
                      </label>
                      <textarea
                        rows={4}
                        value={formData.furtherFeedback}
                        onChange={(e) => handleInputChange('furtherFeedback', e.target.value)}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#025956] focus:border-transparent transition-all resize-none"
                        placeholder="Please share any additional comments or suggestions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Keep Updated */}
                <div className="pt-8 border-t border-[#E5E7EB]">
                  <h2 className="text-2xl font-medium text-[#1E1E1E] mb-6 heading-font">
                    Stay Updated
                  </h2>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="updates"
                      checked={formData.updates}
                      onChange={(e) => handleInputChange('updates', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[#E5E7EB] text-[#025956] focus:ring-[#025956]"
                    />
                    <label htmlFor="updates" className="text-[#6B7280]">
                      I would like to receive updates about this consultation and the planning application process.
                    </label>
                  </div>
                </div>

                {/* GDPR Statement */}
                <div className="pt-8 border-t border-[#E5E7EB]">
                  <h2 className="text-2xl font-medium text-[#1E1E1E] mb-4 heading-font">
                    Data Protection
                  </h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                    SEC Newgate UK has been asked by Green Kite Homes to keep a record of feedback to help understand the level of local interest in this project and to keep the community informed about its progress. The personal data that you provide (name, email, address) will be stored by us and passed on to GKH for this purpose only. We are of the view that we have a legitimate interest in storing this information and passing this information on to GKH for this specific purpose and are processing your data in accordance with the UK General Data Protection Regulation (GDPR). If you would like further information about our legitimate interest, the ways in which we will process information, or if you wish to object to us processing your personal data, please contact us at info@groveheathnorth.co.uk. Any personal data will be handled in accordance with the General Data Protection Regulation (GDPR).
                  </p>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      checked={formData.privacy}
                      onChange={(e) => handleInputChange('privacy', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[#E5E7EB] text-[#025956] focus:ring-[#025956]"
                    />
                    <label htmlFor="privacy" className="text-[#6B7280]">
                      I have read and understand the above data protection statement. I consent to my data being processed as described. *
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#025956] text-white px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-[#037471] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </motion.form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
