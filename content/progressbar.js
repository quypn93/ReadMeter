/**
 * ReadMeter — Progress Bar Module
 * Creates and manages the reading progress bar and floating info panel.
 */

var ReadMeter = window.ReadMeter || {};

(function () {
  'use strict';

  var progressBar = null;
  var fillElement = null;
  var infoElement = null;
  var articleElement = null;
  var readTimeData = null;
  var fadeTimeout = null;
  var ticking = false;

  /**
   * Create the progress bar DOM elements and inject them into the page.
   */
  function createProgressBar(settings) {
    // Don't create if already exists
    if (document.getElementById('readmeter-progress')) return;

    settings = settings || {};
    var color = settings.barColor || '#4CAF50';

    // Create progress bar container
    progressBar = document.createElement('div');
    progressBar.id = 'readmeter-progress';

    // Create fill element
    fillElement = document.createElement('div');
    fillElement.id = 'readmeter-fill';
    fillElement.style.setProperty('background', color, 'important');
    progressBar.appendChild(fillElement);

    // Create floating info element
    infoElement = document.createElement('div');
    infoElement.id = 'readmeter-info';

    document.body.appendChild(progressBar);
    document.body.appendChild(infoElement);

    // Cache article reference and read time
    articleElement = ReadMeter.detectArticle();
    if (articleElement) {
      var userWPM = settings.readingSpeed || null;
      readTimeData = ReadMeter.calculateReadTime(articleElement.textContent || '', articleElement, userWPM);
    }

    // Bind scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial update
    updateProgress();
  }

  /**
   * Throttled scroll handler using requestAnimationFrame.
   */
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * Update the progress bar and info panel based on current scroll position.
   */
  function updateProgress() {
    if (!articleElement || !fillElement || !readTimeData) return;

    var rect = articleElement.getBoundingClientRect();
    var articleTop = window.scrollY + rect.top;
    var articleHeight = rect.height;

    if (articleHeight <= 0) return;

    var scrolled = window.scrollY - articleTop + window.innerHeight * 0.3;
    var progress = Math.min(Math.max(scrolled / articleHeight, 0), 1);

    // Update fill width
    fillElement.style.width = (progress * 100) + '%';

    // Update floating info
    if (infoElement) {
      var percent = Math.round(progress * 100);
      var minutesLeft = Math.ceil(readTimeData.minutes * (1 - progress));

      if (progress > 0.01 && progress < 0.99) {
        var leftText = minutesLeft <= 1 ? '< 1 min left' : minutesLeft + ' min left';
        infoElement.textContent = percent + '% \u00B7 ' + leftText;
        infoElement.style.opacity = '1';

        // Auto-fade after 2 seconds of no scrolling
        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(function () {
          if (infoElement) infoElement.style.opacity = '0';
        }, 2000);
      } else if (progress >= 0.99) {
        infoElement.textContent = 'Done!';
        infoElement.style.opacity = '1';
        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(function () {
          if (infoElement) infoElement.style.opacity = '0';
        }, 3000);
      } else {
        infoElement.style.opacity = '0';
      }
    }
  }

  /**
   * Remove the progress bar from the page.
   */
  function removeProgressBar() {
    window.removeEventListener('scroll', onScroll);
    clearTimeout(fadeTimeout);

    var bar = document.getElementById('readmeter-progress');
    if (bar) bar.remove();

    var info = document.getElementById('readmeter-info');
    if (info) info.remove();

    progressBar = null;
    fillElement = null;
    infoElement = null;
  }

  /**
   * Update progress bar color.
   */
  function updateBarColor(color) {
    if (fillElement) {
      fillElement.style.setProperty('background', color, 'important');
    }
  }

  // Export
  ReadMeter.createProgressBar = createProgressBar;
  ReadMeter.removeProgressBar = removeProgressBar;
  ReadMeter.updateBarColor = updateBarColor;
})();
