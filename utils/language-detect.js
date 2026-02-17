/**
 * Language detection utility for ReadMeter.
 * Detects the language of text content to adjust reading speed (WPM).
 */

// Unicode ranges for CJK characters
const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;

// Vietnamese diacritical characters
const VIETNAMESE_REGEX = /[\u00c0-\u00c3\u00c8-\u00ca\u00cc-\u00cd\u00d2-\u00d5\u00d9-\u00da\u00dd\u00e0-\u00e3\u00e8-\u00ea\u00ec-\u00ed\u00f2-\u00f5\u00f9-\u00fa\u00fd\u0102-\u0103\u0110-\u0111\u0128-\u0129\u0168-\u0169\u01a0-\u01b0\u1ea0-\u1ef9]/g;

/**
 * Detect the primary language of the given text.
 * Returns a BCP-47 language code: 'en', 'vi', 'zh', 'ja', 'ko', or 'default'.
 */
function detectLanguage(text) {
  if (!text || text.length === 0) return 'default';

  // 1. Check the page's lang attribute first
  const pageLang = document.documentElement.lang || '';
  if (pageLang) {
    const lang = pageLang.toLowerCase().split('-')[0];
    if (['en', 'vi', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru'].includes(lang)) {
      return lang;
    }
  }

  // 2. Heuristic: sample the first 2000 characters
  const sample = text.substring(0, 2000);

  // Count CJK characters
  const cjkMatches = sample.match(CJK_REGEX);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  const cjkRatio = cjkCount / sample.length;

  // If more than 15% CJK characters, classify as CJK
  if (cjkRatio > 0.15) {
    // Differentiate between Chinese, Japanese, Korean
    const hiraganaKatakana = sample.match(/[\u3040-\u309f\u30a0-\u30ff]/g);
    if (hiraganaKatakana && hiraganaKatakana.length > 5) return 'ja';

    const hangul = sample.match(/[\uac00-\ud7af]/g);
    if (hangul && hangul.length > 5) return 'ko';

    return 'zh';
  }

  // Count Vietnamese diacritical characters
  const vietMatches = sample.match(VIETNAMESE_REGEX);
  const vietCount = vietMatches ? vietMatches.length : 0;
  const vietRatio = vietCount / sample.length;

  // If more than 3% Vietnamese diacriticals, likely Vietnamese
  if (vietRatio > 0.03) return 'vi';

  // Default to English for Latin-script text
  return 'en';
}
