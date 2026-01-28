'use client';

import { motion } from 'framer-motion';
import LightboxImage from './LightboxImage';

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
                Please complete our survey to let us know your views, or contact the Green Kite Homes
                project team with any questions you may have about the current outline proposals.
              </p>
            </div>
            <div className="mt-10">
              <a href="/feedback" className="btn-primary">
                Share Your Views
              </a>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <LightboxImage
              src="/images/homepage-cgi.png"
              alt="Grove Heath North development CGI"
              className="w-full rounded-lg"
            />
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
              { role: 'Developer & Applicant', name: 'Green Kite Homes', logo: '/images/logos/green-kite-homes.png', darkBg: true },
              { role: 'Planning Consultants', name: 'Stantec', logo: '/images/logos/stantec.png' },
              { role: 'Architects', name: 'rg+p', logo: '/images/logos/rgp.png' },
              { role: 'Landscape Architects', name: 'NDLA', logo: '/images/logos/ndla.svg' },
              { role: 'Community Engagement', name: 'SEC Newgate', logo: '/images/logos/sec-newgate.svg' },
              { role: 'Transport Planning', name: 'Apex', logo: '/images/logos/apex.png' },
            ].map((team, index) => (
              <motion.div
                key={team.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`h-16 flex items-center justify-center mb-3 ${team.darkBg ? 'bg-[#025956] rounded-lg px-3' : ''}`}>
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
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
