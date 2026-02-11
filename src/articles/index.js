// Import all articles
import { metadata as kellyMetadata, content as kellyContent } from './bet-sizing-with-fractional-kelley';
import { metadata as equilibriaMetadata, content as equilibriaContent } from './market-equilibria-fairer-policy';
import { metadata as gameTestingMetadata, content as gameTestingContent } from './game-testing-ai-next-benchmark';
import { metadata as worldViewsMetadata, content as worldViewsContent } from './my-world-views';
import { metadata as leanHungryMetadata, content as leanHungryContent } from './the-lean-and-hungry-look';
import { metadata as whyDraftsMetadata, content as whyDraftsContent } from './why-drafts';

// Helper function to parse date string (MM.DD.YY) to Date object for sorting
const parseDate = (dateStr) => {
  const [month, day, year] = dateStr.split('.').map(Number);
  // Convert 2-digit year to full year (assuming 20XX)
  const fullYear = 2000 + year;
  return new Date(fullYear, month - 1, day); // month is 0-indexed in Date
};

// Export articles array sorted by date (latest first)
const allArticles = [
  {
    ...kellyMetadata,
    content: kellyContent,
  },
  {
    ...equilibriaMetadata,
    content: equilibriaContent,
  },
  {
    ...gameTestingMetadata,
    content: gameTestingContent,
  },
  {
    ...worldViewsMetadata,
    content: worldViewsContent,
  },
  {
    ...leanHungryMetadata,
    content: leanHungryContent,
  },
  {
    ...whyDraftsMetadata,
    content: whyDraftsContent,
  },
];

export const articles = allArticles.sort((a, b) => {
  const dateA = parseDate(a.date);
  const dateB = parseDate(b.date);
  return dateB - dateA; // Descending order (newest first)
});

