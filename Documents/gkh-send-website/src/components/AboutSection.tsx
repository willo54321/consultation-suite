'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#025956] text-sm font-medium tracking-[0.2em] uppercase mb-4">
              About the Project
            </p>
            <h2 className="section-heading text-[#1E1E1E] mb-8">
              About Green Kite Homes
            </h2>
            <div className="space-y-6 text-[#6B7280] text-lg leading-relaxed">
              <p>
                Green Kite Homes is passionate about creating communities and places where people want to live.
                Place-making is an essential element in all Green Kite Homes developments, ensuring that
                successful public spaces become the focus of a new community.
              </p>
              <p>
                The development site, called Grove Heath North by Guildford Borough Council, is located
                southeast of Papercourt Lake. Portsmouth Road runs along its eastern boundary, and
                Burntcommon to the south.
              </p>
            </div>
            <div className="mt-10">
              <a href="/feedback" className="btn-primary">
                Share Your Views
              </a>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { number: '540', label: 'New Homes' },
              { number: '50%', label: 'Affordable' },
              { number: '30%+', label: 'Green Space' },
              { number: '9.2ha', label: 'SANG' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="bg-[#F8F9F7] p-8 rounded-lg text-center"
              >
                <span className="block text-4xl md:text-5xl font-light text-[#025956] mb-2">
                  {stat.number}
                </span>
                <span className="text-[#6B7280] text-sm tracking-wide uppercase">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* The Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mt-20 pt-16 border-t border-gray-200"
        >
          <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-8 text-center heading-font">The Team</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { role: 'Developer & Applicant', name: 'Green Kite Homes' },
              { role: 'Planning Consultants', name: 'Stantec' },
              { role: 'Architects', name: 'rg+p' },
              { role: 'Landscape Architects', name: 'NDLA' },
              { role: 'Community Engagement', name: 'SEC Newgate' },
              { role: 'Transport Planning', name: 'Apex' },
            ].map((team, index) => (
              <motion.div
                key={team.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-[#025956] font-medium mb-1">{team.name}</p>
                <p className="text-[#6B7280] text-sm">{team.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
