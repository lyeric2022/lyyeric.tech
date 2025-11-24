/**
 * Extracts text content from a React element recursively
 * This function traverses the React element tree and collects all text nodes
 */
function extractTextFromElement(element) {
  if (!element) return '';
  
  // If it's a string or number, return it directly
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element);
  }
  
  // If it's an array, recursively process each element
  if (Array.isArray(element)) {
    return element.map(extractTextFromElement).join(' ');
  }
  
  // If it's a React element, extract text from its children
  if (element && typeof element === 'object') {
    // Handle React elements (they have props.children)
    if (element.props && element.props.children) {
      return extractTextFromElement(element.props.children);
    }
  }
  
  return '';
}

/**
 * Counts words in a text string
 * Splits by whitespace and filters out empty strings
 */
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculates reading time in minutes based on article content
 * Uses average reading speed of 200 words per minute
 * 
 * @param {React.Element} content - The JSX content of the article
 * @returns {number} Reading time in minutes (rounded up to nearest integer)
 */
export function calculateReadingTime(content) {
  if (!content) return 0;
  
  // Extract all text from the React element
  const text = extractTextFromElement(content);
  
  // Count words
  const wordCount = countWords(text);
  
  // Average reading speed: 200 words per minute
  // Round up to ensure we don't show 0 for very short articles
  const readingTime = Math.ceil(wordCount / 150);
  
  return Math.max(1, readingTime); // Minimum 1 minute
}

