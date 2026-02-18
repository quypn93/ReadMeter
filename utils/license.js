/**
 * ReadMeter — LemonSqueezy License Manager
 * Handles premium license activation, validation, and status checks.
 *
 * Integration flow:
 * 1. User clicks "Upgrade" → opens LemonSqueezy checkout in new tab
 * 2. After purchase, user receives license key via email
 * 3. User enters license key in extension popup
 * 4. Extension activates key via LemonSqueezy License API
 * 5. Background worker validates license periodically (once/day)
 */

var ReadMeterLicense = (function () {
  'use strict';

  // ============================================================
  // CONFIGURATION — Replace these with your actual LemonSqueezy IDs
  // ============================================================
  var CONFIG = {
    // Your LemonSqueezy store ID (find in Dashboard → Settings)
    storeId: 0,

    // Your product ID for ReadMeter Premium
    productId: 0,

    // Checkout URL for the premium product
    // Format: https://YOURSTORE.lemonsqueezy.com/checkout/buy/PRODUCT_SLUG
    checkoutUrl: '',

    // LemonSqueezy License API base URL
    apiBase: 'https://api.lemonsqueezy.com/v1/licenses',

    // How often to re-validate (in minutes). Default: once per day
    validateIntervalMinutes: 60 * 24,

    // Alarm name for periodic validation
    alarmName: 'readmeter-license-validate'
  };

  // ============================================================
  // LICENSE API
  // ============================================================

  /**
   * Activate a license key. Called when user enters their key.
   * Creates a new "instance" tied to this browser/extension install.
   *
   * @param {string} licenseKey - The license key from purchase
   * @returns {Promise<{success: boolean, error?: string, data?: object}>}
   */
  function activateLicense(licenseKey) {
    if (!licenseKey || !licenseKey.trim()) {
      return Promise.resolve({ success: false, error: 'Please enter a license key.' });
    }

    return fetch(CONFIG.apiBase + '/activate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        license_key: licenseKey.trim(),
        instance_name: 'ReadMeter Chrome Extension'
      })
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.activated) {
        // Verify this key belongs to our product
        if (CONFIG.storeId > 0 && data.meta && data.meta.store_id !== CONFIG.storeId) {
          return { success: false, error: 'This license key is not valid for ReadMeter.' };
        }
        if (CONFIG.productId > 0 && data.meta && data.meta.product_id !== CONFIG.productId) {
          return { success: false, error: 'This license key is not valid for ReadMeter.' };
        }

        // Save license data
        var licenseData = {
          licenseKey: licenseKey.trim(),
          instanceId: data.instance.id,
          licenseStatus: 'active',
          customerEmail: data.meta.customer_email || '',
          customerName: data.meta.customer_name || '',
          productName: data.meta.product_name || '',
          variantName: data.meta.variant_name || '',
          activatedAt: new Date().toISOString(),
          lastValidated: new Date().toISOString(),
          expiresAt: data.license_key.expires_at || null
        };

        return new Promise(function (resolve) {
          chrome.storage.local.set({ readmeterLicense: licenseData }, function () {
            // Set up periodic validation
            setupValidationAlarm();
            resolve({ success: true, data: licenseData });
          });
        });
      } else {
        return { success: false, error: data.error || 'Activation failed. Please check your license key.' };
      }
    })
    .catch(function (err) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    });
  }

  /**
   * Validate an existing license key + instance.
   * Called periodically to ensure the license is still valid.
   *
   * @returns {Promise<{valid: boolean, status?: string, error?: string}>}
   */
  function validateLicense() {
    return new Promise(function (resolve) {
      chrome.storage.local.get('readmeterLicense', function (result) {
        var license = result.readmeterLicense;
        if (!license || !license.licenseKey || !license.instanceId) {
          resolve({ valid: false, status: 'none', error: 'No license found.' });
          return;
        }

        fetch(CONFIG.apiBase + '/validate', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            license_key: license.licenseKey,
            instance_id: license.instanceId
          })
        })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          // Verify product ownership
          if (CONFIG.storeId > 0 && data.meta && data.meta.store_id !== CONFIG.storeId) {
            resolve({ valid: false, status: 'invalid', error: 'License not valid for ReadMeter.' });
            return;
          }

          var status = data.license_key ? data.license_key.status : 'unknown';

          // Update stored license status
          license.licenseStatus = data.valid ? 'active' : status;
          license.lastValidated = new Date().toISOString();
          if (data.license_key && data.license_key.expires_at) {
            license.expiresAt = data.license_key.expires_at;
          }

          chrome.storage.local.set({ readmeterLicense: license }, function () {
            resolve({
              valid: data.valid,
              status: status,
              expiresAt: data.license_key ? data.license_key.expires_at : null
            });
          });
        })
        .catch(function () {
          // Network error — don't invalidate license, just skip this check
          resolve({ valid: true, status: 'network_error', error: 'Could not reach server.' });
        });
      });
    });
  }

  /**
   * Deactivate the current license instance.
   * Frees up an activation slot for the user.
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  function deactivateLicense() {
    return new Promise(function (resolve) {
      chrome.storage.local.get('readmeterLicense', function (result) {
        var license = result.readmeterLicense;
        if (!license || !license.licenseKey || !license.instanceId) {
          // No license to deactivate — just clear local data
          chrome.storage.local.remove('readmeterLicense', function () {
            resolve({ success: true });
          });
          return;
        }

        fetch(CONFIG.apiBase + '/deactivate', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            license_key: license.licenseKey,
            instance_id: license.instanceId
          })
        })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          // Clear local license data regardless of API response
          chrome.storage.local.remove('readmeterLicense', function () {
            clearValidationAlarm();
            resolve({ success: data.deactivated !== false });
          });
        })
        .catch(function () {
          // Network error — still clear local data
          chrome.storage.local.remove('readmeterLicense', function () {
            clearValidationAlarm();
            resolve({ success: true });
          });
        });
      });
    });
  }

  // ============================================================
  // STATUS HELPERS
  // ============================================================

  /**
   * Get current license status from local storage.
   * @returns {Promise<{isPremium: boolean, license: object|null}>}
   */
  function getLicenseStatus() {
    return new Promise(function (resolve) {
      chrome.storage.local.get('readmeterLicense', function (result) {
        var license = result.readmeterLicense;
        if (!license || !license.licenseKey) {
          resolve({ isPremium: false, license: null });
          return;
        }

        var isPremium = license.licenseStatus === 'active';

        // Check expiration
        if (isPremium && license.expiresAt) {
          var expiresAt = new Date(license.expiresAt);
          if (expiresAt < new Date()) {
            isPremium = false;
            license.licenseStatus = 'expired';
            chrome.storage.local.set({ readmeterLicense: license });
          }
        }

        resolve({ isPremium: isPremium, license: license });
      });
    });
  }

  /**
   * Open the LemonSqueezy checkout page in a new tab.
   */
  function openCheckout() {
    if (CONFIG.checkoutUrl) {
      chrome.tabs.create({ url: CONFIG.checkoutUrl });
    }
  }

  // ============================================================
  // PERIODIC VALIDATION (background worker)
  // ============================================================

  /**
   * Set up a Chrome alarm for periodic license validation.
   */
  function setupValidationAlarm() {
    if (chrome.alarms) {
      chrome.alarms.create(CONFIG.alarmName, {
        periodInMinutes: CONFIG.validateIntervalMinutes
      });
    }
  }

  /**
   * Clear the validation alarm.
   */
  function clearValidationAlarm() {
    if (chrome.alarms) {
      chrome.alarms.clear(CONFIG.alarmName);
    }
  }

  /**
   * Handle alarm events. Call this from the background service worker.
   */
  function handleAlarm(alarm) {
    if (alarm.name === CONFIG.alarmName) {
      validateLicense().then(function (result) {
        if (!result.valid && result.status !== 'network_error') {
          // License is no longer valid — features will be locked
          // on next popup open / content script check
        }
      });
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    CONFIG: CONFIG,
    activate: activateLicense,
    validate: validateLicense,
    deactivate: deactivateLicense,
    getStatus: getLicenseStatus,
    openCheckout: openCheckout,
    setupValidationAlarm: setupValidationAlarm,
    handleAlarm: handleAlarm
  };
})();
