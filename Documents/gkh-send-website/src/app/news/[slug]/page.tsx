'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import { newsItems } from '@/components/NewsCarousel';

// Extended content for news articles with richer structure
const articleContent: Record<string, { intro: string; paragraphs: string[]; pullQuote?: string }> = {
  'lorem-ipsum-article': {
    intro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    paragraphs: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    ],
    pullQuote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
};

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const article = newsItems.find((item) => item.slug === slug);
  const content = articleContent[slug];

  if (!article || !content) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-[#1E1E1E] mb-4 heading-font">Article not found</h1>
          <Link href="/news" className="text-[#025956] hover:underline">
            ← Back to news
          </Link>
        </div>
      </main>
    );
  }

  // Get related articles (excluding current)
  const relatedArticles = newsItems.filter((item) => item.slug !== slug).slice(0, 3);

  // Calculate reading time (rough estimate)
  const wordCount = [content.intro, ...content.paragraphs].join(' ').split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <main className="min-h-screen bg-white">
      {/* Full-width Hero Image */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Back Button */}
        <div className="absolute top-32 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              Back to news
            </Link>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Category Badge */}
              <span className="inline-block bg-[#025956] text-white text-xs font-medium tracking-[0.15em] uppercase px-4 py-2 rounded mb-6">
                {article.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-white leading-[1.1] heading-font max-w-4xl">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 mt-8 text-white/70">
                <span className="flex items-center gap-2 text-sm">
                  <Calendar size={16} />
                  {article.date}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Clock size={16} />
                  {readingTime} min read
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="max-w-3xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Lead Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-[#1E1E1E] leading-relaxed mb-12 font-light"
        >
          {content.intro}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-24 h-px bg-[#025956] mb-12 origin-left"
        />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          {content.paragraphs.map((paragraph, index) => (
            <div key={index}>
              <p className="text-[#1E1E1E] text-lg leading-[1.8]">
                {paragraph}
              </p>

              {/* Insert pull quote after second paragraph */}
              {index === 1 && content.pullQuote && (
                <blockquote className="my-12 py-8 border-l-4 border-[#025956] pl-8 lg:pl-12 lg:-ml-12">
                  <p className="text-2xl md:text-3xl text-[#025956] font-light leading-relaxed heading-font italic">
                    "{content.pullQuote}"
                  </p>
                </blockquote>
              )}
            </div>
          ))}
        </motion.div>

      </section>

      {/* CTA Section */}
      <section className="bg-[#025956] py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl text-white heading-font mb-6">
              Have your say on our proposals
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              We want to hear from you. Share your feedback and help shape the future of this development.
            </p>
            <Link
              href="/#consultation"
              className="inline-flex items-center gap-3 bg-white text-[#025956] px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-colors"
            >
              Get involved
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <h2 className="section-heading text-[#1E1E1E]">Related news</h2>
            <Link
              href="/news"
              className="hidden md:inline-flex items-center gap-2 text-[#025956] font-medium hover:gap-3 transition-all"
            >
              View all
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedArticles.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Link href={`/news/${item.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-4 right-4 bg-[#025956] text-white text-xs font-medium tracking-wider uppercase px-4 py-2 rounded">
                      {item.date}
                    </span>
                  </div>
                  <span className="text-[#025956] text-xs font-medium tracking-[0.15em] uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-medium text-[#1E1E1E] mt-2 group-hover:text-[#025956] transition-colors heading-font leading-tight">
                    {item.title}
                  </h3>
                </Link>
              </motion.article>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-[#025956] font-medium"
            >
              View all news
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
