'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';

export default function InfrastructurePage() {
  const infrastructureItems = [
    'Highways infrastructure and public transport requirements.',
    'Education requirements including nursery, primary, secondary and further education needs.',
    'Healthcare requirements including doctors and dentist provision.',
    'Onsite provision of community facilities such as community hub or small commercial shop.',
    'Foul and surface water drainage capacities.',
    'Utility provision.',
  ];

  const nearbyFacilities = {
    schools: [
      'Ripley Court School',
      'Hoe Bridge School',
      'St John the Baptist School',
      'Woking College',
      'Kingfield School',
      'Send CofE Primary School',
    ],
    restaurants: [
      'The Talbot Inn',
      'Half Moon Inn',
      'Ripley Curry Garden',
      'The Ship',
      'Pinnocks',
      'The Ripley Anchor',
      'The Jovial Sailor',
      'The Saddlers Arms',
    ],
    shops: [
      'Ferma Farm Shop',
      'Waitrose',
      'Ripley Nurseries',
      'Villages Medical Practice',
      'Retail Park',
      'Shell',
    ],
  };

  return (
    <>
      <ProposalPageHeader
        title="Infrastructure Requirements"
        subtitle="The development must provide the infrastructure required to support the new community."
        prevPage={{ name: 'Water Management', href: '/proposals/water-management' }}
        nextPage={{ name: 'Transport & Access', href: '/proposals/transport-access' }}
      />

      {/* Introduction */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
                The development must provide the infrastructure required to enable it to support the
                new community without detrimental impact or additional pressure on the existing community.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
                While new homes are needed and larger communities can support local businesses and
                the demand for nearby services, we are also taking into the effect of other approved
                developments in the area.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed">
                We are at an early stage in our journey and do not yet know exactly what infrastructure
                will be required.
              </p>
            </motion.div>

            {/* Infrastructure Items */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#025956] p-8">
                <h3 className="text-xl font-semibold text-white mb-6 heading-font">
                  Areas Being Explored
                </h3>
                <p className="text-white/80 mb-6 text-sm">
                  Through pre-application discussions with the council and its consultants we will be exploring:
                </p>
                <ul className="space-y-4">
                  {infrastructureItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/90">
                      <span className="w-2 h-2 bg-[#7dd3c0] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nearby Facilities */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-[#1E1E1E] mb-12 heading-font"
          >
            Nearby Facilities
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Schools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6"
            >
              <h4 className="font-semibold text-[#025956] mb-4 uppercase tracking-wide text-sm">
                Schools & Education
              </h4>
              <ul className="space-y-2">
                {nearbyFacilities.schools.map((item, index) => (
                  <li key={index} className="text-[#6B7280] text-sm">{item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Restaurants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6"
            >
              <h4 className="font-semibold text-[#025956] mb-4 uppercase tracking-wide text-sm">
                Restaurants & Pubs
              </h4>
              <ul className="space-y-2">
                {nearbyFacilities.restaurants.map((item, index) => (
                  <li key={index} className="text-[#6B7280] text-sm">{item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Shops */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6"
            >
              <h4 className="font-semibold text-[#025956] mb-4 uppercase tracking-wide text-sm">
                Shops & Retail
              </h4>
              <ul className="space-y-2">
                {nearbyFacilities.shops.map((item, index) => (
                  <li key={index} className="text-[#6B7280] text-sm">{item}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Financial Contributions */}
      <section className="section-padding bg-[#025956]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl font-semibold text-white mb-6 heading-font">
              Financial Contributions
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              The development will provide financial contributions through Section 106 agreements
              to fund infrastructure improvements that benefit both the new community and existing
              residents in the area.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
