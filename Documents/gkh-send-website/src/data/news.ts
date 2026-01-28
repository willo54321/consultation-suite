// News data - shared between server and client components
export const newsItems = [
  {
    id: 2,
    slug: 'consultation-documents-available',
    title: 'Consultation documents now available to download',
    excerpt: 'All documents from our public consultation events are now available to view and download from our project documents page.',
    date: '22 January 26',
    image: '/images/103-297 - View 01 A-01.webp',
    category: 'Update',
  },
];

export const articleContent: Record<string, { intro: string; paragraphs: string[]; pullQuote?: string; linkText?: string; linkHref?: string }> = {
  'consultation-documents-available': {
    intro: 'All documents from our recent public consultation events are now available to view and download from our project documents page.',
    paragraphs: [
      'The documents include our exhibition banners which provide detailed information about the Grove Heath North proposals, as well as our feedback form for those who wish to share their views.',
      'Our technical plans are also available, including the Illustrative Site Layout, Land Use Diagram, Facilities Plan, and Travel Connection Plan.',
      'We encourage all members of the community to review these documents and share their feedback on our proposals.',
    ],
    linkText: 'View all documents',
    linkHref: '/documents',
  },
};
