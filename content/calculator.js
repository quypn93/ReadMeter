/**
 * ReadMeter — Read Time Calculator Module
 * Calculates estimated reading time based on word count, language, and images.
 */

var ReadMeter = window.ReadMeter || {};

(function () {
  'use strict';

  // Default words-per-minute by language
  var WPM_DEFAULTS = {
    en: 238,
    vi: 180,
    zh: 158,
    ja: 193,
    ko: 200,
    fr: 214,
    de: 227,
    es: 218,
    pt: 215,
    ru: 184,
    default: 200
  };

  /**
   * Calculate the estimated read time for the given text.
   *
   * @param {string} text - The article text content
   * @param {HTMLElement} articleElement - The article DOM element (for counting images)
   * @param {number|null} userWPM - User-configured words-per-minute (overrides language default)
   * @returns {{ minutes: number, wordCount: number, language: string, totalSeconds: number }}
   */
  function calculateReadTime(text, articleElement, userWPM) {
    var lang = (typeof detectLanguage === 'function') ? detectLanguage(text) : 'default';
    var wpm = userWPM || WPM_DEFAULTS[lang] || WPM_DEFAULTS['default'];

    var wordCount = ReadMeter.getWordCount(text);

    // Count images inside the article
    var imageCount = 0;
    if (articleElement) {
      imageCount = articleElement.querySelectorAll('img').length;
    }

    // Add time for images: 12s for first, decreasing by 1s each, minimum 3s
    var imageTime = 0;
    for (var i = 0; i < imageCount; i++) {
      imageTime += Math.max(3, 12 - i);
    }

    var readTimeSeconds = (wordCount / wpm) * 60;
    var totalSeconds = readTimeSeconds + imageTime;
    var totalMinutes = Math.ceil(totalSeconds / 60);

    return {
      minutes: Math.max(1, totalMinutes),
      wordCount: wordCount,
      language: lang,
      totalSeconds: totalSeconds
    };
  }

  /**
   * Format read time as a human-readable string.
   * @param {number} minutes
   * @returns {string}
   */
  function formatReadTime(minutes) {
    if (minutes < 1) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return minutes + ' min read';
  }

  // Export
  ReadMeter.calculateReadTime = calculateReadTime;
  ReadMeter.formatReadTime = formatReadTime;
  ReadMeter.WPM_DEFAULTS = WPM_DEFAULTS;
})();
