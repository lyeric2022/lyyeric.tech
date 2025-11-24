// Import all articles
import { metadata as kellyMetadata, content as kellyContent } from './bet-sizing-with-fractional-kelley';
import { metadata as equilibriaMetadata, content as equilibriaContent } from './market-equilibria-fairer-policy';

// Export articles array in the same format as before
export const articles = [
  {
    ...kellyMetadata,
    content: kellyContent,
  },
  {
    ...equilibriaMetadata,
    content: equilibriaContent,
  },
];

