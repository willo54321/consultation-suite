'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';

const events = [
  {
    date: 'Thursday, January 22',
    time: '4:00 PM – 8:00 PM',
    venue: 'Papercourt Sailing Club',
    address: 'Polesden Lane, Ripley GU23 6JX',
  },
  {
    date: 'Saturday, January 24',
    time: '10:00 AM – 2:00 PM',
    venue: 'Ripley Village Hall',
    address: 'High Street, Ripley GU23 6AF',
  },
];

export default function ConsultationSection() {
  return (
    <section id="consultation" className="section-padding bg-[#025956]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#7dd3c0] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Public Consultation
          </p>
          <h2 className="section-heading text-white mb-6">
            Have your say
          </h2>
          <p className="sub-heading text-white/70 max-w-2xl mx-auto">
            Meet the project team, explore our proposals in detail, and share your feedback
            at one of our public exhibitions. Proposals also available online from January 22.
          </p>
        </motion.div>

        {/* Exhibition Events */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white rounded-lg p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#025956] flex items-center justify-center">
                  <Calendar className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-[#025956] font-medium">{event.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#6B7280] mb-4">
                <Clock size={16} />
                <span className="text-lg font-medium text-[#1E1E1E]">{event.time}</span>
              </div>

              <div className="flex items-start gap-2 text-[#6B7280]">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#1E1E1E]">{event.venue}</p>
                  <p className="text-sm">{event.address}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Online Feedback CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-white/70 mb-6">
            Can't make it to an event? Share your feedback online.
          </p>
          <a
            href="/feedback"
            className="inline-block bg-white text-[#025956] px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-all"
          >
            Give Feedback Online
          </a>
        </motion.div>
      </div>
    </section>
  );
}
