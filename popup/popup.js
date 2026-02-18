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
    loadLicenseStatus();
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

    // Premium elements
    elements.premiumUpsell = document.getElementById('premiumUpsell');
    elements.premiumActive = document.getElementById('premiumActive');
    elements.buyBtn = document.getElementById('buyBtn');
    elements.licenseKeyInput = document.getElementById('licenseKeyInput');
    elements.activateBtn = document.getElementById('activateBtn');
    elements.licenseError = document.getElementById('licenseError');
    elements.licenseEmail = document.getElementById('licenseEmail');
    elements.licenseStatusText = document.getElementById('licenseStatusText');
    elements.licenseExpires = document.getElementById('licenseExpires');
    elements.deactivateBtn = document.getElementById('deactivateBtn');
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

    // Premium events
    elements.buyBtn.addEventListener('click', handleBuy);
    elements.activateBtn.addEventListener('click', handleActivate);
    elements.deactivateBtn.addEventListener('click', handleDeactivate);
    elements.licenseKeyInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleActivate();
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

  // ============================================================
  // Premium / License Management
  // ============================================================

  /**
   * Load and display current license status.
   */
  function loadLicenseStatus() {
    chrome.runtime.sendMessage({ type: 'getLicenseStatus' }, function (response) {
      if (chrome.runtime.lastError || !response) {
        showUpsell();
        return;
      }

      if (response.isPremium && response.license) {
        showPremiumActive(response.license);
      } else {
        showUpsell();
      }
    });
  }

  /**
   * Show the upsell/upgrade view.
   */
  function showUpsell() {
    elements.premiumUpsell.style.display = 'block';
    elements.premiumActive.style.display = 'none';
    hideLicenseError();
  }

  /**
   * Show the "premium active" view with license details.
   */
  function showPremiumActive(license) {
    elements.premiumUpsell.style.display = 'none';
    elements.premiumActive.style.display = 'block';

    elements.licenseEmail.textContent = license.customerEmail || '--';

    var status = license.licenseStatus || 'unknown';
    elements.licenseStatusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);

    if (license.expiresAt) {
      var date = new Date(license.expiresAt);
      elements.licenseExpires.textContent = date.toLocaleDateString();
    } else {
      elements.licenseExpires.textContent = 'Never';
    }
  }

  /**
   * Handle "Get Premium" button click — open checkout.
   */
  function handleBuy() {
    chrome.runtime.sendMessage({ type: 'openCheckout' });
  }

  /**
   * Handle license key activation.
   */
  function handleActivate() {
    var key = elements.licenseKeyInput.value.trim();
    if (!key) {
      showLicenseError('Please enter a license key.');
      return;
    }

    elements.activateBtn.disabled = true;
    elements.activateBtn.textContent = '...';
    hideLicenseError();

    chrome.runtime.sendMessage({ type: 'activateLicense', licenseKey: key }, function (response) {
      elements.activateBtn.disabled = false;
      elements.activateBtn.textContent = 'Activate';

      if (chrome.runtime.lastError) {
        showLicenseError('Could not connect. Please try again.');
        return;
      }

      if (response && response.success) {
        showPremiumActive(response.data);
      } else {
        showLicenseError(response ? response.error : 'Activation failed.');
      }
    });
  }

  /**
   * Handle license deactivation.
   */
  function handleDeactivate() {
    elements.deactivateBtn.disabled = true;
    elements.deactivateBtn.textContent = 'Deactivating...';

    chrome.runtime.sendMessage({ type: 'deactivateLicense' }, function (response) {
      elements.deactivateBtn.disabled = false;
      elements.deactivateBtn.textContent = 'Deactivate License';

      if (response && response.success) {
        elements.licenseKeyInput.value = '';
        showUpsell();
      }
    });
  }

  /**
   * Show a license error message.
   */
  function showLicenseError(message) {
    elements.licenseError.textContent = message;
    elements.licenseError.style.display = 'block';
  }

  /**
   * Hide the license error message.
   */
  function hideLicenseError() {
    elements.licenseError.style.display = 'none';
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();
