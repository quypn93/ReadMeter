/**
 * ReadMeter — Background Service Worker
 * Handles article detection messages, tracks reading stats,
 * and manages license validation via LemonSqueezy.
 */

// Import license manager
importScripts('../utils/license.js');

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'articleDetected') {
    handleArticleDetected(message.data);
  } else if (message.type === 'activateLicense') {
    ReadMeterLicense.activate(message.licenseKey).then(sendResponse);
    return true; // async
  } else if (message.type === 'deactivateLicense') {
    ReadMeterLicense.deactivate().then(sendResponse);
    return true;
  } else if (message.type === 'validateLicense') {
    ReadMeterLicense.validate().then(sendResponse);
    return true;
  } else if (message.type === 'getLicenseStatus') {
    ReadMeterLicense.getStatus().then(sendResponse);
    return true;
  } else if (message.type === 'openCheckout') {
    ReadMeterLicense.openCheckout();
  }
});

/**
 * Handle an article detection event from a content script.
 * Updates today's reading stats.
 */
function handleArticleDetected(data) {
  var today = new Date().toISOString().split('T')[0];
  var statsKey = 'stats_' + today;

  chrome.storage.local.get(statsKey, function (result) {
    var stats = result[statsKey] || { articles: 0, totalMinutes: 0, urls: [] };

    // Avoid counting the same article twice
    if (stats.urls && stats.urls.indexOf(data.url) !== -1) {
      return;
    }

    stats.articles += 1;
    stats.totalMinutes += data.readTime || 0;
    if (!stats.urls) stats.urls = [];
    stats.urls.push(data.url);

    var update = {};
    update[statsKey] = stats;
    chrome.storage.local.set(update);
  });
}

// Clean up old stats and set up license validation
chrome.runtime.onInstalled.addListener(function () {
  cleanupOldStats();
  ReadMeterLicense.setupValidationAlarm();
});

chrome.runtime.onStartup.addListener(function () {
  cleanupOldStats();
  ReadMeterLicense.setupValidationAlarm();
});

// Handle license validation alarm
chrome.alarms.onAlarm.addListener(function (alarm) {
  ReadMeterLicense.handleAlarm(alarm);
});

function cleanupOldStats() {
  chrome.storage.local.get(null, function (allData) {
    var keysToRemove = [];
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    var cutoffStr = cutoff.toISOString().split('T')[0];

    Object.keys(allData).forEach(function (key) {
      if (key.startsWith('stats_')) {
        var dateStr = key.replace('stats_', '');
        if (dateStr < cutoffStr) {
          keysToRemove.push(key);
        }
      }
    });

    if (keysToRemove.length > 0) {
      chrome.storage.local.remove(keysToRemove);
    }
  });
}
