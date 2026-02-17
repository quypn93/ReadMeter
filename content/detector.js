/**
 * ReadMeter — Article Detection Module
 * Detects the main article content on any webpage.
 */

var ReadMeter = window.ReadMeter || {};

(function () {
  'use strict';

  // Selectors commonly used for article content areas
  const ARTICLE_SELECTORS = [
    'article',
    '[role="article"]',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-content',
    '.article-body',
    '.entry-content',
    '.post-body',
    '.story-body',
    '.content-body',
    '#article-body',
    '#post-content',
    '.markdown-body',
    '.prose',
  ];

  // Selectors to exclude (non-content areas)
  const EXCLUDE_SELECTORS = [
    'nav', 'header', 'footer', 'aside',
    '.sidebar', '.nav', '.menu', '.footer', '.header',
    '.comments', '#comments', '.comment-section',
    '.related-posts', '.recommended', '.advertisement',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.social-share', '.share-buttons',
  ];

  /**
   * Calculate text density for an element (text length / total HTML length).
   * Higher density = more likely to be article content.
   */
  function getTextDensity(element) {
    const text = element.textContent || '';
    const html = element.innerHTML || '';
    if (html.length === 0) return 0;
    return text.trim().length / html.length;
  }

  /**
   * Score an element for how likely it is to be the main article content.
   */
  function scoreElement(element) {
    const text = (element.textContent || '').trim();
    const wordCount = text.split(/\s+/).length;
    const textLength = text.length;

    if (textLength < 500) return 0;

    let score = 0;

    // Base score from text length (log scale)
    score += Math.log(textLength) * 10;

    // Bonus for text density
    const density = getTextDensity(element);
    score += density * 50;

    // Bonus for paragraph count
    const paragraphs = element.querySelectorAll('p');
    score += Math.min(paragraphs.length, 20) * 5;

    // Bonus for word count
    score += Math.min(wordCount, 2000) * 0.05;

    // Penalty for being too deep in the DOM
    let depth = 0;
    let parent = element;
    while (parent.parentElement) {
      depth++;
      parent = parent.parentElement;
    }
    score -= depth * 2;

    // Penalty for containing too many links relative to text
    const links = element.querySelectorAll('a');
    const linkText = Array.from(links).reduce((sum, a) => sum + (a.textContent || '').length, 0);
    const linkRatio = linkText / Math.max(textLength, 1);
    if (linkRatio > 0.5) score -= 50;

    return score;
  }

  /**
   * Find the element with the highest text density as a fallback.
   */
  function findHighestTextDensityElement() {
    // Check common content wrappers
    const candidates = document.querySelectorAll('div, section');
    let bestElement = null;
    let bestScore = 0;

    candidates.forEach(function (el) {
      // Skip excluded elements
      for (const sel of EXCLUDE_SELECTORS) {
        if (el.matches(sel) || el.closest(sel)) return;
      }

      const score = scoreElement(el);
      if (score > bestScore) {
        bestScore = score;
        bestElement = el;
      }
    });

    return bestElement;
  }

  /**
   * Detect the main article element on the page.
   * Returns the DOM element containing the article, or null.
   */
  function detectArticle() {
    // Try each article selector in priority order
    for (const selector of ARTICLE_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = (el.textContent || '').trim();
        if (text.length > 500) {
          return el;
        }
      }
    }

    // Fallback: find the element with the highest content score
    return findHighestTextDensityElement();
  }

  /**
   * Count words in text content. Handles Latin scripts (space-separated)
   * and CJK characters (each character ~ one word).
   */
  function getWordCount(text) {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return 0;

    // Count CJK characters individually
    const cjkChars = (cleaned.match(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;

    // Remove CJK characters and count remaining words
    const nonCjk = cleaned.replace(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, ' ').trim();
    const latinWords = nonCjk ? nonCjk.split(/\s+/).filter(function (w) { return w.length > 0; }).length : 0;

    return latinWords + cjkChars;
  }

  /**
   * Determine if the current page is an article worth showing ReadMeter on.
   * Requires at least 300 words (~1.5 min read).
   */
  function isArticlePage() {
    const article = detectArticle();
    if (!article) return false;

    const wordCount = getWordCount(article.textContent || '');
    return wordCount > 300;
  }

  // Export to ReadMeter namespace
  ReadMeter.detectArticle = detectArticle;
  ReadMeter.getWordCount = getWordCount;
  ReadMeter.isArticlePage = isArticlePage;
})();
