'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';
import Link from 'next/link';

export default function TimelinePage() {
  const timelineItems = [
    {
      date: '2024 - 2025',
      title: 'Site Promotion',
      description: "Promotion of the Site in Guildford Local Plan 'Call for Sites'",
      status: 'completed',
    },
    {
      date: 'May 2025',
      title: 'Pre-application Discussions',
      description: 'Pre-application discussions with Guildford Borough Council',
      status: 'completed',
    },
    {
      date: 'September 2025',
      title: 'Pre-application Advice',
      description: 'Pre-application advice received',
      status: 'completed',
    },
    {
      date: 'December 2025',
      title: 'Planning Agreement',
      description: 'Planning Performance Agreement signed with Guildford Borough Council',
      status: 'completed',
    },
    {
      date: 'December 2025',
      title: 'EIA Scoping',
      description: 'EIA Scoping submitted to Guildford Borough Council',
      status: 'completed',
    },
    {
      date: 'January - February 2026',
      title: 'Parish Council Consultation',
      description: 'Ongoing consultation with Send and Ripley Parish Councils',
      status: 'current',
    },
    {
      date: 'January - February 2026',
      title: 'Public Consultation',
      description: 'Public consultation period',
      status: 'current',
    },
    {
      date: '24 February 2026',
      title: 'Survey Closes',
      description: 'Close of public consultation survey',
      status: 'upcoming',
    },
    {
      date: 'Spring 2026',
      title: 'Application Submission',
      description: 'Submission of Outline Application to Guildford Borough Council',
      status: 'upcoming',
    },
    {
      date: 'Summer 2026',
      title: 'Decision',
      description: 'Possible application decision by Guildford Borough Council',
      status: 'upcoming',
    },
  ];

  return (
    <>
      <ProposalPageHeader
        title="Timeline & Next Steps"
        subtitle="Follow our journey from consultation through to planning submission."
        prevPage={{ name: 'Transport & Access', href: '/proposals/transport-access' }}
      />

      {/* Introduction */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
              Throughout the planning application process, Green Kite Homes and the development
              team will work with parish councils, local organisations, and planning, transport,
              and ecology experts from Guildford Borough Council and Surrey County Council to
              refine our proposals.
            </p>
            <p className="text-[#6B7280] text-lg leading-relaxed">
              The guide timeline for a decision on major planning applications like this can be
              13 weeks from the time of validation of the application.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-[#1E1E1E] mb-12 heading-font"
          >
            Project Timeline
          </motion.h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#025956]/20 transform md:-translate-x-1/2" />

            <div className="space-y-8">
              {timelineItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div
                      className={`bg-white p-6 ${
                        item.status === 'current' ? 'border-2 border-[#025956]' : ''
                      }`}
                    >
                      <span
                        className={`text-sm font-medium uppercase tracking-wide ${
                          item.status === 'completed'
                            ? 'text-[#6B7280]'
                            : item.status === 'current'
                            ? 'text-[#025956]'
                            : 'text-[#025956]/60'
                        }`}
                      >
                        {item.date}
                      </span>
                      <h4 className="font-semibold text-[#1E1E1E] mt-1 mb-2">{item.title}</h4>
                      <p className="text-[#6B7280] text-sm">{item.description}</p>
                      {item.status === 'current' && (
                        <span className="inline-block mt-3 text-xs font-medium text-white bg-[#025956] px-3 py-1">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        item.status === 'completed'
                          ? 'bg-[#025956] border-[#025956]'
                          : item.status === 'current'
                          ? 'bg-white border-[#025956]'
                          : 'bg-white border-[#025956]/40'
                      }`}
                    />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Have Your Say */}
      <section className="section-padding bg-[#025956]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold text-white mb-4 heading-font">
              Have Your Say
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Please take the time to complete our survey to give us valuable feedback about
              your priorities for the community. You can also register to be kept informed at
              every stage, and email us any time with questions or comments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/feedback"
                className="bg-white text-[#025956] px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-all"
              >
                Complete Survey
              </Link>
              <Link
                href="/#contact"
                className="border-2 border-white text-white px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#F8F9F7] p-8"
            >
              <h3 className="font-semibold text-[#1E1E1E] mb-4">Online</h3>
              <p className="text-[#6B7280] mb-2">
                Visit our website:{' '}
                <a href="https://groveheathnorth.co.uk" className="text-[#025956] hover:underline">
                  groveheathnorth.co.uk
                </a>
              </p>
              <p className="text-[#6B7280]">
                Email:{' '}
                <a href="mailto:info@groveheathnorth.co.uk" className="text-[#025956] hover:underline">
                  info@groveheathnorth.co.uk
                </a>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#F8F9F7] p-8"
            >
              <h3 className="font-semibold text-[#1E1E1E] mb-4">By Post</h3>
              <p className="text-[#6B7280]">
                Send your feedback via FREEPOST:<br />
                <strong>FREEPOST SEC NEWGATE UK LOCAL</strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
