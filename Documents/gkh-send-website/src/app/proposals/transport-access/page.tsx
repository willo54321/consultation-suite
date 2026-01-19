'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';

export default function TransportAccessPage() {
  const developmentBenefits = [
    'Financial contributions to public transport',
    'Traffic calming on Portsmouth Road',
    'A car club',
  ];

  return (
    <>
      <ProposalPageHeader
        title="Transport & Access"
        subtitle="Our initial studies show that the site is well-connected for both nearby amenities and commuting."
        prevPage={{ name: 'Infrastructure', href: '/proposals/infrastructure' }}
        nextPage={{ name: 'Timeline', href: '/proposals/timeline' }}
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
              Vehicle, pedestrian and cycle links will be enhanced, ensuring that the new
              community integrates within the existing locality. The new community would encourage
              walking and cycling by delivering the travel infrastructure required by the site and
              the surrounding area.
            </p>
            <p className="text-[#6B7280] text-lg leading-relaxed">
              We recognise the importance of transport links in this location. The application will
              be supported by a Transport Assessment and Travel Plan, devised in consultation with
              Surrey County Council and National Highways.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Access Details */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Vehicle Access */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-[#025956] p-8 h-full">
                <h3 className="text-xl font-semibold text-white mb-4 heading-font">
                  Vehicle Access
                </h3>
                <p className="text-white/90 mb-6">
                  Vehicle access would be via a new access junction from Portsmouth Road, with
                  existing access retained as additional emergency access to the north of the junction.
                </p>
                <p className="text-white/90">
                  All parts of the site would then be connected by secondary routes. The junction
                  location and design would be agreed with Surrey County Council and National Highways.
                </p>
              </div>
            </motion.div>

            {/* Pedestrian & Cycle */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#025956] p-8 h-full">
                <h3 className="text-xl font-semibold text-white mb-4 heading-font">
                  Pedestrian & Cycle Strategy
                </h3>
                <p className="text-white/90 mb-6">
                  Pedestrian and cycle access to the site would be significantly enhanced, including
                  connections to established public rights of way and particularly to local facilities
                  in Ripley and Send.
                </p>
                <p className="text-white/90">
                  Options include a new connection to Portsmouth Road near Send Marsh Road to provide
                  a route through the site for pedestrians and cyclists.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Access Points */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-[#1E1E1E] mb-12 heading-font"
          >
            Proposed Access Points
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Primary Vehicle Access', description: 'New junction from Portsmouth Road' },
              { title: 'Emergency Access', description: 'Retained existing access to the north' },
              { title: 'Pedestrian Connection', description: 'New link to Send Marsh Road via public footpath' },
              { title: 'Cycle Connection', description: 'Potential connection to Portsmouth Road' },
            ].map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F8F9F7] p-6"
              >
                <div className="w-10 h-10 bg-[#025956] rounded-full flex items-center justify-center text-white font-medium mb-4">
                  {index + 1}
                </div>
                <h4 className="font-semibold text-[#1E1E1E] mb-2">{point.title}</h4>
                <p className="text-[#6B7280] text-sm">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Benefits */}
      <section className="section-padding bg-[#025956]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold text-white mb-4 heading-font">
              Development Benefits
            </h2>
            <p className="text-white/80 mb-8 max-w-3xl">
              We welcome ideas from local residents on how this development could contribute
              positively to the transport infrastructure. In collaboration with Surrey County Council
              and National Highways, transport infrastructure improvements could include:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {developmentBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 p-6 border border-white/20"
                >
                  <span className="text-[#7dd3c0] text-4xl font-light mb-2 block">{index + 1}</span>
                  <p className="text-white">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Healthy Streets */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-4 heading-font">
              Healthy Streets for Surrey
            </h3>
            <p className="text-[#6B7280] text-lg">
              While the street layout directs vehicles to the primary access route, pedestrians
              and cyclists have a range of alternative access options. Within the site, the road
              network would follow the &apos;Healthy Streets for Surrey&apos; design code, prioritising
              the needs of non-motorised users.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
