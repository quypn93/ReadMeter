# ReadMeter — Read Time & Progress Bar

A Chrome Extension that displays estimated reading time and a scroll progress bar on any article page.

---

## Features

- **Auto-detect articles** — Automatically identifies the main content area on any webpage using semantic selectors and text density scoring
- **Read time badge** — Shows "X min read" at the top of detected articles with word count
- **Progress bar** — A slim 3px bar fixed at the top of the browser, filling as you scroll through the article
- **Remaining time** — Floating indicator showing "43% · 4 min left" that updates in real-time
- **Language-aware** — Adjusts reading speed (WPM) based on detected language (English, Vietnamese, Chinese, Japanese, Korean)
- **Customizable** — Toggle features on/off, change bar color, set your own reading speed
- **Daily stats** — Tracks articles read and total reading time per day
- **Lightweight** — No external dependencies, minimal performance impact, zero network requests

## Installation

### From source (Developer mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/quypn93/ReadMeter.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked**

5. Select the `ReadMeter` project folder

6. The ReadMeter icon will appear in your extensions toolbar

### From Chrome Web Store

> Coming soon

## Usage

1. **Navigate to any article** — ReadMeter automatically detects articles with 300+ words
2. **Read time badge** appears at the top of the article showing estimated reading time
3. **Progress bar** fills at the top of the browser as you scroll
4. **Floating info** appears in the bottom-right showing percentage and remaining time (auto-fades after 2 seconds)
5. **Click the extension icon** to open settings or view today's reading stats

## Settings

| Setting        | Description                                | Default   |
| -------------- | ------------------------------------------ | --------- |
| Enabled        | Turn the extension on/off                  | ON        |
| Show Badge     | Show "X min read" badge on articles        | ON        |
| Progress Bar   | Show scroll progress bar                   | ON        |
| Bar Color      | Color of the progress bar                  | `#4CAF50` |
| Reading Speed  | Words per minute (100-400)                 | Auto (by language) |

## Project Structure

```
ReadMeter/
├── manifest.json              # Chrome Extension Manifest V3
├── content/
│   ├── detector.js            # Article detection logic
│   ├── calculator.js          # Read time calculation
│   ├── progressbar.js         # Progress bar UI and scroll tracking
│   ├── badge.js               # Read time badge + initialization
│   └── styles.css             # Styles for injected elements
├── popup/
│   ├── popup.html             # Settings popup layout
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup logic and settings management
├── background/
│   └── service-worker.js      # Stats tracking background worker
├── utils/
│   └── language-detect.js     # Language detection utility
├── icons/
│   ├── icon-16.png            # 16x16 toolbar icon
│   ├── icon-48.png            # 48x48 extension page icon
│   └── icon-128.png           # 128x128 Web Store icon
└── _locales/
    ├── en/messages.json       # English strings
    └── vi/messages.json       # Vietnamese strings
```

## How It Works

### Article Detection

ReadMeter uses a multi-strategy approach to find the main article content:

1. **Semantic HTML** — Looks for `<article>`, `<main>`, `[role="main"]` tags
2. **Common selectors** — Checks for `.post-content`, `.entry-content`, `.article-body`, etc.
3. **Text density scoring** — Falls back to scoring all `<div>` and `<section>` elements by:
   - Text length (log scale)
   - Text-to-HTML density ratio
   - Paragraph count
   - Link-to-text ratio (penalizes navigation-heavy areas)
   - DOM depth (penalizes deeply nested elements)

Articles must have **300+ words** to trigger ReadMeter (approximately 1.5 minutes of reading).

### Reading Speed by Language

| Language   | Default WPM |
| ---------- | ----------- |
| English    | 238         |
| Vietnamese | 180         |
| Chinese    | 158         |
| Japanese   | 193         |
| Korean     | 200         |
| French     | 214         |
| German     | 227         |
| Spanish    | 218         |
| Other      | 200         |

### Performance

- Scroll events use `{ passive: true }` and `requestAnimationFrame` throttling
- No external API calls — everything runs locally
- Minimal DOM injection (3 elements total)
- CSS transitions for smooth animations
- z-index set to maximum to avoid conflicts

## Permissions

| Permission  | Reason                                      |
| ----------- | ------------------------------------------- |
| `storage`   | Save user settings and daily reading stats  |
| `activeTab` | Communicate with the active tab's content script |

ReadMeter does **not** collect any personal data, does **not** make network requests, and does **not** track browsing history.

## Development

### Prerequisites

- Google Chrome (version 88+ for Manifest V3 support)
- Basic understanding of Chrome Extension development

### Making changes

1. Edit files in the project directory
2. Go to `chrome://extensions/`
3. Click the reload button on the ReadMeter card
4. Refresh the test page to see changes

### Generating icons

```bash
python3 generate_icons.py
```

## Browser Compatibility

- Google Chrome 88+
- Microsoft Edge 88+ (Chromium-based)
- Brave Browser
- Opera (Chromium-based)

## License

MIT

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.
