'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Download, Image, FileText } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const documents = [
  {
    category: 'Consultation Materials',
    items: [
      {
        title: 'Exhibition Banners',
        description: 'View our exhibition banners with detailed information about the proposals.',
        type: 'PDF',
        size: '9.4 MB',
        icon: Image,
        href: '/documents/GKH - Exhibition Banners.pdf',
      },
      {
        title: 'Feedback Form',
        description: 'Download and complete our feedback form to share your views on the proposals.',
        type: 'PDF',
        size: '1.1 MB',
        icon: FileText,
        href: '/documents/GKH - Feedback Form.pdf',
      },
    ],
  },
  {
    category: 'Technical Plans',
    items: [
      {
        title: 'Illustrative Site Layout',
        description: 'Overview of the proposed site layout showing housing, green spaces and infrastructure.',
        type: 'PDF',
        size: '2.2 MB',
        icon: Image,
        href: '/documents/103-297 Illustrative Site Layout_Apex.pdf',
      },
      {
        title: 'Land Use Diagram',
        description: 'Diagram showing the proposed land uses across the site.',
        type: 'PDF',
        size: '2.1 MB',
        icon: Image,
        href: '/documents/103-297 Land Use Diagram.pdf',
      },
      {
        title: 'Facilities Plan',
        description: 'Plan showing proposed community facilities and amenities.',
        type: 'PDF',
        size: '7.0 MB',
        icon: Image,
        href: '/documents/103-297 Facilities Plan.pdf',
      },
      {
        title: 'Travel Connection Plan',
        description: 'Plan showing pedestrian, cycle and vehicle connections.',
        type: 'PDF',
        size: '7.1 MB',
        icon: Image,
        href: '/documents/103-297 Travel Connection Plan.pdf',
      },
          ],
  },
];

export default function DocumentsPage() {
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
              Document Library
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="sub-heading text-white/70 mt-6 max-w-2xl"
            >
              Download our exhibition boards, consultation materials, and feedback forms.
            </motion.p>
          </div>
        </section>

        {/* Documents Section */}
        <section className="section-padding">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            {documents.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className={categoryIndex > 0 ? 'mt-16' : ''}
              >
                <h2 className="text-2xl font-medium text-[#1E1E1E] mb-8 heading-font">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.items.map((doc, docIndex) => {
                    const Icon = doc.icon;
                    return (
                      <motion.a
                        key={doc.title}
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: categoryIndex * 0.1 + docIndex * 0.05 }}
                        className="group flex items-start gap-4 p-6 bg-[#F8F9F7] rounded-lg hover:bg-[#025956]/5 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#025956]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#025956] transition-colors">
                          <Icon className="text-[#025956] group-hover:text-white transition-colors" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-[#1E1E1E] group-hover:text-[#025956] transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-[#6B7280] text-sm mt-1">
                            {doc.description}
                          </p>
                          <p className="text-[#6B7280] text-xs mt-2">
                            {doc.type} • {doc.size}
                          </p>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <div className="w-10 h-10 rounded-full border border-[#E5E7EB] flex items-center justify-center group-hover:border-[#025956] group-hover:bg-[#025956] transition-all">
                            <Download className="text-[#6B7280] group-hover:text-white transition-colors" size={18} />
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 p-6 bg-[#025956]/5 rounded-lg"
            >
              <p className="text-[#6B7280] text-sm">
                <strong className="text-[#1E1E1E]">Need help?</strong> If you have any issues downloading documents or would like to request printed copies, please <Link href="/#contact" className="text-[#025956] underline">contact us</Link>.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
