/**
 * ReadMeter — Read Time Badge Module
 * Injects a "X min read" badge at the top of detected articles.
 */

var ReadMeter = window.ReadMeter || {};

(function () {
  'use strict';

  var badgeElement = null;
  var initialized = false;

  // Default settings
  var DEFAULT_SETTINGS = {
    enabled: true,
    showBadge: true,
    showProgressBar: true,
    barColor: '#4CAF50',
    readingSpeed: null // null = use language default
  };

  /**
   * Create and inject the read time badge at the top of the article.
   */
  function createBadge(articleElement, readTimeData, settings) {
    if (!articleElement || !readTimeData) return;
    if (document.getElementById('readmeter-badge')) return;

    settings = settings || {};

    badgeElement = document.createElement('div');
    badgeElement.id = 'readmeter-badge';

    var icon = document.createElement('span');
    icon.className = 'readmeter-icon';
    icon.textContent = '\uD83D\uDCD6'; // book emoji

    var timeText = document.createElement('span');
    timeText.className = 'readmeter-time';
    timeText.textContent = ReadMeter.formatReadTime(readTimeData.minutes);

    var separator = document.createElement('span');
    separator.className = 'readmeter-separator';
    separator.textContent = '\u00B7';

    var wordText = document.createElement('span');
    wordText.className = 'readmeter-words';
    wordText.textContent = readTimeData.wordCount.toLocaleString() + ' words';

    badgeElement.appendChild(icon);
    badgeElement.appendChild(timeText);
    badgeElement.appendChild(separator);
    badgeElement.appendChild(wordText);

    // Insert at the beginning of the article
    var firstChild = articleElement.firstChild;

    // Try to find a heading to insert after
    var heading = articleElement.querySelector('h1, h2');
    if (heading && heading.parentElement === articleElement) {
      heading.insertAdjacentElement('afterend', badgeElement);
    } else if (firstChild) {
      articleElement.insertBefore(badgeElement, firstChild);
    } else {
      articleElement.appendChild(badgeElement);
    }
  }

  /**
   * Remove the badge from the page.
   */
  function removeBadge() {
    var badge = document.getElementById('readmeter-badge');
    if (badge) badge.remove();
    badgeElement = null;
  }

  /**
   * Initialize ReadMeter on the current page.
   * This is the main entry point called after all modules are loaded.
   */
  function initialize() {
    if (initialized) return;
    initialized = true;

    // Load settings from storage, then initialize
    chrome.storage.sync.get(DEFAULT_SETTINGS, function (settings) {
      if (!settings.enabled) return;
      if (!ReadMeter.isArticlePage()) return;

      var article = ReadMeter.detectArticle();
      if (!article) return;

      var userWPM = settings.readingSpeed || null;
      var readTimeData = ReadMeter.calculateReadTime(article.textContent || '', article, userWPM);

      if (settings.showBadge) {
        createBadge(article, readTimeData, settings);
      }

      if (settings.showProgressBar) {
        ReadMeter.createProgressBar(settings);
      }

      // Notify background script about the article
      chrome.runtime.sendMessage({
        type: 'articleDetected',
        data: {
          url: window.location.href,
          title: document.title,
          wordCount: readTimeData.wordCount,
          readTime: readTimeData.minutes,
          language: readTimeData.language
        }
      });
    });

    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.type === 'updateSettings') {
        handleSettingsUpdate(message.settings);
      } else if (message.type === 'getArticleInfo') {
        var article = ReadMeter.detectArticle();
        if (article) {
          var data = ReadMeter.calculateReadTime(article.textContent || '', article);
          sendResponse({
            detected: true,
            wordCount: data.wordCount,
            readTime: data.minutes,
            language: data.language
          });
        } else {
          sendResponse({ detected: false });
        }
        return true; // async response
      }
    });
  }

  /**
   * Handle settings updates from the popup.
   */
  function handleSettingsUpdate(settings) {
    // Remove existing elements
    removeBadge();
    ReadMeter.removeProgressBar();

    if (!settings.enabled) return;
    if (!ReadMeter.isArticlePage()) return;

    var article = ReadMeter.detectArticle();
    if (!article) return;

    var userWPM = settings.readingSpeed || null;
    var readTimeData = ReadMeter.calculateReadTime(article.textContent || '', article, userWPM);

    if (settings.showBadge) {
      createBadge(article, readTimeData, settings);
    }

    if (settings.showProgressBar) {
      ReadMeter.createProgressBar(settings);
    }
  }

  // Export
  ReadMeter.createBadge = createBadge;
  ReadMeter.removeBadge = removeBadge;
  ReadMeter.initialize = initialize;

  // Auto-initialize when the script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
