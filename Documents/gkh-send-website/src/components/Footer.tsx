'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <img
              src="/GKH-Logo.webp"
              alt="Green Kite Homes"
              className="h-12 w-auto brightness-0 invert mb-4"
            />
            <p className="text-white/60 leading-relaxed max-w-md">
              Green Kite Homes is developing a new residential community at
              Grove Heath North. We are committed to working with the local
              community to shape our proposals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['About', 'The Vision', 'Have Your Say', 'FAQs', 'Contact'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase().replace(' ', '-')}`}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Legal
            </h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Cookie Policy', 'Terms of Use', 'Accessibility'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <p className="text-white/40 text-sm text-center">
            © 2026 SEC Newgate UK / Green Kite Homes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
