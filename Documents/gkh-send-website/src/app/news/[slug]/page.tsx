import { newsItems } from '@/data/news';
import NewsArticleContent from './NewsArticleContent';

export function generateStaticParams() {
  return newsItems.map((item) => ({
    slug: item.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <NewsArticleContent slug={slug} />;
}
