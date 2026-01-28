'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <a href="/">
              <img
                src="/GKH-Logo.webp"
                alt="Green Kite Homes"
                className="h-12 w-auto brightness-0 invert mb-4"
              />
            </a>
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
              {[
                { name: 'About the Site', href: '/proposals/about-the-site' },
                { name: 'Our Vision', href: '/proposals/our-vision' },
                { name: 'Our Proposals', href: '/proposals/our-proposals' },
                { name: 'Have Your Say', href: '/feedback' },
                { name: 'Documents', href: '/documents' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Contact
            </h4>
            <p className="text-white/60 mb-4">
              Get in touch with our project team:
            </p>
            <a
              href="mailto:info@groveheathnorth.co.uk"
              className="text-[#7dd3c0] hover:text-white transition-colors"
            >
              info@groveheathnorth.co.uk
            </a>
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
