/**
 * ReadMeter — Popup Script
 * Manages the settings popup UI and communicates with content scripts.
 */

(function () {
  'use strict';

  // Default settings
  var DEFAULT_SETTINGS = {
    enabled: true,
    showBadge: true,
    showProgressBar: true,
    barColor: '#4CAF50',
    readingSpeed: null
  };

  // DOM elements
  var elements = {};

  /**
   * Initialize the popup.
   */
  function init() {
    cacheElements();
    bindEvents();
    loadSettings();
    loadStats();
    queryCurrentTab();
  }

  /**
   * Cache DOM element references.
   */
  function cacheElements() {
    elements.settingsToggle = document.getElementById('settingsToggle');
    elements.settingsPanel = document.getElementById('settingsPanel');
    elements.enabledToggle = document.getElementById('enabledToggle');
    elements.badgeToggle = document.getElementById('badgeToggle');
    elements.progressToggle = document.getElementById('progressToggle');
    elements.barColor = document.getElementById('barColor');
    elements.speedSlider = document.getElementById('speedSlider');
    elements.speedValue = document.getElementById('speedValue');
    elements.articleDetected = document.getElementById('articleDetected');
    elements.noArticle = document.getElementById('noArticle');
    elements.articleReadTime = document.getElementById('articleReadTime');
    elements.articleWords = document.getElementById('articleWords');
    elements.statArticles = document.getElementById('statArticles');
    elements.statTime = document.getElementById('statTime');
  }

  /**
   * Bind event listeners.
   */
  function bindEvents() {
    elements.settingsToggle.addEventListener('click', toggleSettings);
    elements.enabledToggle.addEventListener('change', saveSettings);
    elements.badgeToggle.addEventListener('change', saveSettings);
    elements.progressToggle.addEventListener('change', saveSettings);
    elements.barColor.addEventListener('input', saveSettings);
    elements.speedSlider.addEventListener('input', function () {
      elements.speedValue.textContent = elements.speedSlider.value + ' WPM';
      saveSettings();
    });
  }

  /**
   * Toggle settings panel visibility.
   */
  function toggleSettings() {
    var panel = elements.settingsPanel;
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }

  /**
   * Load settings from chrome.storage.sync.
   */
  function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function (settings) {
      elements.enabledToggle.checked = settings.enabled;
      elements.badgeToggle.checked = settings.showBadge;
      elements.progressToggle.checked = settings.showProgressBar;
      elements.barColor.value = settings.barColor;

      if (settings.readingSpeed) {
        elements.speedSlider.value = settings.readingSpeed;
        elements.speedValue.textContent = settings.readingSpeed + ' WPM';
      }
    });
  }

  /**
   * Save settings to chrome.storage.sync and notify content script.
   */
  function saveSettings() {
    var settings = {
      enabled: elements.enabledToggle.checked,
      showBadge: elements.badgeToggle.checked,
      showProgressBar: elements.progressToggle.checked,
      barColor: elements.barColor.value,
      readingSpeed: parseInt(elements.speedSlider.value, 10)
    };

    chrome.storage.sync.set(settings, function () {
      // Notify the active tab's content script about the settings change
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'updateSettings',
            settings: settings
          }).catch(function () {
            // Content script might not be loaded on this page
          });
        }
      });
    });
  }

  /**
   * Query the current tab for article info.
   */
  function queryCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, { type: 'getArticleInfo' })
        .then(function (response) {
          if (response && response.detected) {
            showArticleInfo(response);
          } else {
            showNoArticle();
          }
        })
        .catch(function () {
          showNoArticle();
        });
    });
  }

  /**
   * Show article info in the popup.
   */
  function showArticleInfo(data) {
    elements.articleDetected.style.display = 'flex';
    elements.noArticle.style.display = 'none';

    var timeText = data.readTime === 1 ? '1 min read' : data.readTime + ' min read';
    elements.articleReadTime.textContent = timeText;
    elements.articleWords.textContent = data.wordCount.toLocaleString() + ' words \u00B7 ' + data.language.toUpperCase();
  }

  /**
   * Show "no article" message.
   */
  function showNoArticle() {
    elements.articleDetected.style.display = 'none';
    elements.noArticle.style.display = 'block';
  }

  /**
   * Load today's reading stats.
   */
  function loadStats() {
    var today = new Date().toISOString().split('T')[0];
    var statsKey = 'stats_' + today;

    chrome.storage.local.get(statsKey, function (data) {
      var stats = data[statsKey] || { articles: 0, totalMinutes: 0 };
      elements.statArticles.textContent = stats.articles;
      elements.statTime.textContent = stats.totalMinutes;
    });
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();
