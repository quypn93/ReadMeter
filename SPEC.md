# ReadMeter — Product Specification

> Chrome Extension hiển thị thời gian đọc ước tính và thanh tiến trình khi đọc bất kỳ bài viết nào trên web.

---

## 1. Vấn đề cần giải quyết

- Bạn mở 1 bài viết dài → không biết mất bao lâu để đọc → dễ bỏ qua hoặc mất kiên nhẫn giữa chừng
- Medium có "5 min read" và progress bar → trải nghiệm đọc tốt hơn hẳn → nhưng 99% website khác không có
- Người đọc muốn biết: "Mình đang ở đâu trong bài viết?" và "Còn bao lâu nữa?"
- Đặc biệt quan trọng khi research nhiều tabs — cần prioritize đọc bài nào trước

---

## 2. Giải pháp

**ReadMeter** tự động detect nội dung chính của bất kỳ article/blog nào và hiển thị:

- ⏱ **Estimated Read Time** — badge nhỏ góc trên bài viết (vd: "7 min read")
- 📊 **Progress Bar** — thanh mỏng cố định trên cùng browser, fill dần khi scroll
- 📍 **Phần trăm đã đọc** — "43% · 4 min left"

---

## 3. Tính năng chi tiết

### 3.1 Core Features (MVP — Free)

| Feature             | Mô tả                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Auto-detect article | Dùng Readability algorithm (giống Firefox Reader View) để tách nội dung chính khỏi sidebar, ads, menu             |
| Read time badge     | Hiển thị "X min read" ở đầu bài viết. Tốc độ mặc định: 200-250 từ/phút (tiếng Anh), 150-200 từ/phút (tiếng Việt) |
| Progress bar        | Thanh ngang mỏng (3px) fixed top, màu tuỳ chọn, fill từ trái sang phải theo scroll position                      |
| Remaining time      | Khi scroll: hiển thị "X min left" cập nhật real-time                                                              |
| Minimal UI          | Không popup, không notification — chỉ hiển thị khi đang đọc article                                               |

### 3.2 Nice-to-have Features (v2)

| Feature               | Mô tả                                                                              |
| --------------------- | ---------------------------------------------------------------------------------- |
| Custom speed          | User tự set tốc độ đọc của mình (slow/medium/fast hoặc WPM cụ thể)                 |
| Dark/light theme      | Progress bar tự adapt theo theme website                                            |
| Keyboard shortcut     | Nhấn phím để toggle on/off                                                          |
| Multi-language detect | Tự nhận diện ngôn ngữ → adjust WPM cho phù hợp (tiếng Việt đọc chậm hơn tiếng Anh) |
| Stats dashboard       | Popup nhỏ: hôm nay đọc bao nhiêu bài, tổng bao nhiêu phút, streak                  |

### 3.3 Potential Premium Features (v3)

| Feature             | Mô tả                                     |
| ------------------- | ----------------------------------------- |
| Reading history     | Log các bài đã đọc + % hoàn thành         |
| Reading goals       | Set mục tiêu: đọc 30 phút/ngày → tracking |
| Export stats        | Export reading log ra CSV/Notion           |
| Sync across devices | Cloud sync settings + history              |

---

## 4. Thiết kế UI/UX

### 4.1 Progress Bar

```
┌─────────────────────────────────────────────────────────┐
│████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← 43% · 4 min left
└─────────────────────────────────────────────────────────┘
  ↑ Fixed top, 3px height, z-index cao nhất
  ↑ Màu mặc định: #4CAF50 (xanh lá) — user có thể đổi
  ↑ Smooth animation khi scroll
```

### 4.2 Read Time Badge

```
┌──────────────────────────────────┐
│  📖 7 min read                   │  ← Inject vào đầu article
│                                  │     Font nhỏ, màu xám nhạt
│  Article Title Here...           │     Không che nội dung
│  ...                             │
└──────────────────────────────────┘
```

### 4.3 Floating Info (khi scroll)

```
                              ┌─────────────┐
                              │  43%        │  ← Góc phải dưới
                              │  4 min left │     Fade out sau 2s
                              └─────────────┘
```

### 4.4 Popup Settings (click icon extension)

```
┌────────────────────────────┐
│  ReadMeter ⚙               │
│                            │
│  Reading Speed:            │
│  [━━━━━━●━━━━] 230 WPM    │
│                            │
│  Progress Bar: [ON/OFF]    │
│  Bar Color:   [🟢] pick   │
│  Position:    [Top ▼]     │
│  Show Badge:  [ON/OFF]    │
│                            │
│  ─── Today's Stats ───    │
│  Articles: 5               │
│  Time read: 47 min         │
└────────────────────────────┘
```

---

## 5. Kiến trúc kỹ thuật

### 5.1 Cấu trúc project

```
readmeter/
├── manifest.json          # Manifest V3
├── content/
│   ├── detector.js        # Detect article content
│   ├── calculator.js      # Tính read time
│   ├── progressbar.js     # Render progress bar
│   ├── badge.js           # Render read time badge
│   └── styles.css         # Styles cho injected elements
├── popup/
│   ├── popup.html         # Settings popup
│   ├── popup.js
│   └── popup.css
├── background/
│   └── service-worker.js  # Background logic
├── utils/
│   ├── readability.js     # Article extraction (Mozilla Readability)
│   └── language-detect.js # Detect ngôn ngữ bài viết
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── _locales/              # i18n
    ├── en/messages.json
    └── vi/messages.json
```

### 5.2 Manifest V3

```json
{
  "manifest_version": 3,
  "name": "ReadMeter — Read Time & Progress Bar",
  "version": "1.0.0",
  "description": "See reading time and progress on any article",
  "permissions": ["storage", "activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": [
        "content/detector.js",
        "content/calculator.js",
        "content/progressbar.js",
        "content/badge.js"
      ],
      "css": ["content/styles.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background/service-worker.js"
  }
}
```

### 5.3 Core Logic — Detect Article

```javascript
// detector.js — Xác định bài viết chính trên trang
function detectArticle() {
  // Ưu tiên 1: <article> tag
  const article = document.querySelector('article');
  if (article && article.textContent.trim().length > 500) {
    return article;
  }

  // Ưu tiên 2: role="main" hoặc id="content"
  const main = document.querySelector(
    '[role="main"], #content, .post-content, .article-body, .entry-content'
  );
  if (main && main.textContent.trim().length > 500) {
    return main;
  }

  // Ưu tiên 3: Dùng Mozilla Readability algorithm
  // Tìm element có density text cao nhất
  return findHighestTextDensityElement();
}

function isArticlePage() {
  const article = detectArticle();
  if (!article) return false;

  const wordCount = getWordCount(article.textContent);
  // Chỉ hiển thị cho bài > 300 từ (khoảng 1.5 phút đọc)
  return wordCount > 300;
}
```

### 5.4 Core Logic — Calculate Read Time

```javascript
// calculator.js
const WPM_DEFAULTS = {
  en: 238, // Trung bình tiếng Anh
  vi: 180, // Tiếng Việt (ước tính)
  zh: 158, // Tiếng Trung
  ja: 193, // Tiếng Nhật
  default: 200,
};

function calculateReadTime(text, userWPM = null) {
  const lang = detectLanguage(text);
  const wpm = userWPM || WPM_DEFAULTS[lang] || WPM_DEFAULTS.default;

  const wordCount = getWordCount(text);
  const imageCount = document.querySelectorAll(
    'article img, [role="main"] img'
  ).length;

  // Thêm 12 giây cho mỗi hình ảnh (giảm dần)
  let imageTime = 0;
  for (let i = 0; i < imageCount; i++) {
    imageTime += Math.max(3, 12 - i);
  }

  const readTimeMinutes = wordCount / wpm;
  const totalSeconds = readTimeMinutes * 60 + imageTime;
  const totalMinutes = Math.ceil(totalSeconds / 60);

  return {
    minutes: totalMinutes,
    wordCount: wordCount,
    language: lang,
  };
}

function getWordCount(text) {
  // Xử lý cả tiếng Anh (tách bằng space) và tiếng Việt/CJK
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.split(/\s+/).length;
}
```

### 5.5 Core Logic — Progress Bar

```javascript
// progressbar.js
function createProgressBar(settings) {
  const bar = document.createElement('div');
  bar.id = 'readmeter-progress';
  bar.innerHTML = `
    <div id="readmeter-fill"></div>
    <span id="readmeter-info"></span>
  `;
  document.body.prepend(bar);

  const article = detectArticle();
  const totalReadTime = calculateReadTime(article.textContent);

  window.addEventListener(
    'scroll',
    () => {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const progress = Math.min(Math.max(scrolled / articleHeight, 0), 1);

      const fill = document.getElementById('readmeter-fill');
      fill.style.width = `${progress * 100}%`;

      const info = document.getElementById('readmeter-info');
      const minutesLeft = Math.ceil(totalReadTime.minutes * (1 - progress));
      if (progress > 0 && progress < 1) {
        info.textContent = `${Math.round(progress * 100)}% · ${minutesLeft} min left`;
        info.style.opacity = '1';
      } else {
        info.style.opacity = '0';
      }
    },
    { passive: true }
  );
}
```

### 5.6 CSS

```css
/* content/styles.css */
#readmeter-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 2147483647; /* Cao nhất có thể */
  pointer-events: none;
}

#readmeter-fill {
  height: 100%;
  width: 0%;
  background: var(--readmeter-color, #4caf50);
  transition: width 0.1s ease-out;
  border-radius: 0 2px 2px 0;
}

#readmeter-badge {
  display: inline-block;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

#readmeter-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 2147483646;
}
```

---

## 6. Phân tích thị trường

### 6.1 Đối thủ hiện tại

| Extension           | Users | Rating | Hạn chế                                           |
| ------------------- | ----- | ------ | ------------------------------------------------- |
| Readism             | ~2K   | 3.8    | Chỉ read time, không progress bar                 |
| Reading Time        | ~1K   | 4.0    | UI cũ, không detect article tốt                   |
| Scroll Progress Bar | ~5K   | 3.5    | Chỉ progress bar, không read time                 |
| Mercury Reader      | ~100K | 4.5    | Reader mode (đổi layout), không phải progress bar |

**Nhận xét:** Không có extension nào kết hợp tốt cả read time + progress bar + remaining time. Các đối thủ đều nhỏ, UX kém, ít update.

### 6.2 Thị trường mục tiêu

- **Primary:** Knowledge workers, researchers, students — đọc nhiều articles mỗi ngày
- **Secondary:** Content consumers — đọc blog, news, longform
- **Tertiary:** Non-native English readers — cần biết thời gian để lên kế hoạch đọc

### 6.3 Ước tính user potential

- Medium có ~100M monthly readers → họ đã quen với read time feature
- Substack, blog WordPress, news sites → KHÔNG có feature này
- Nếu 0.01% internet users install → ~50K-100K users
- Target thực tế 6 tháng đầu: 5K-10K users

---

## 7. Kế hoạch phát triển

### Phase 1: MVP (3-5 ngày)

- [x] Setup project Manifest V3
- [x] Article detection (article tag + fallback selectors)
- [x] Word count + read time calculation
- [x] Progress bar (fixed top)
- [x] Read time badge inject
- [x] Basic popup settings (on/off, color picker)
- [ ] Test trên 20 popular sites (Medium, Substack, WordPress, news sites VN)

### Phase 2: Polish (3-5 ngày)

- [x] Remaining time display
- [x] Custom reading speed setting
- [x] Language detection → adjust WPM
- [x] Smooth animations
- [ ] Edge cases: infinite scroll, multi-page articles, SPA sites
- [ ] Icon design (professional)
- [ ] Chrome Web Store listing (screenshots, description, keywords)

### Phase 3: Launch (2-3 ngày)

- [ ] Publish lên Chrome Web Store
- [ ] Post lên Product Hunt
- [ ] Share trên Reddit (r/chrome, r/productivity, r/InternetIsBeautiful)
- [ ] Post Indie Hackers
- [ ] Share lên các group Facebook dev/productivity VN

### Phase 4: Growth & Premium (tháng 2-3)

- [x] LemonSqueezy payment integration (license key activation/validation)
- [x] Premium UI trong popup (upsell + license management)
- [ ] Reading stats dashboard (articles read, time spent)
- [ ] Reading history
- [ ] Daily/weekly reading goals
- [ ] Export to Notion/Google Sheets
- [ ] Cross-device sync (premium $2-3/tháng)

---

## 8. Monetization Strategy

### Payment Provider: LemonSqueezy

Sử dụng **LemonSqueezy** (https://lemonsqueezy.com) làm payment provider vì:

- Merchant of Record — LemonSqueezy xử lý thuế, VAT, hoá đơn cho tất cả quốc gia
- License Key API — tích hợp trực tiếp vào Chrome extension, không cần backend riêng
- Phí: 5% + $0.50/giao dịch (hợp lý cho sản phẩm nhỏ)
- Dashboard quản lý customers, subscriptions, license keys
- Hỗ trợ cả one-time payment và subscription

### Flow thanh toán trong extension

```
User click "Get Premium" trong popup
    → Mở LemonSqueezy checkout page (new tab)
    → User thanh toán bằng card/PayPal
    → Nhận license key qua email
    → Nhập license key vào extension popup
    → Extension gọi LemonSqueezy License API để activate
    → Premium features được unlock
    → Background worker validate license 1 lần/ngày
```

### Freemium Model (Recommended)

| Free                    | Premium ($2-3/tháng hoặc $20/năm)   |
| ----------------------- | ------------------------------------ |
| Read time badge         | Reading history & log                |
| Progress bar            | Daily/weekly reading goals           |
| Basic settings          | Export stats ra CSV                  |
| Language detection      | Cloud sync across devices            |
| Daily stats (7 ngày)    | Custom themes                        |
|                         | Unlimited stats history              |

### Technical Implementation

- **Module:** `utils/license.js` — LemonSqueezy License API client
- **Activate:** `POST /v1/licenses/activate` — khi user nhập key
- **Validate:** `POST /v1/licenses/validate` — chạy tự động 1 lần/ngày via Chrome Alarms
- **Deactivate:** `POST /v1/licenses/deactivate` — khi user muốn chuyển thiết bị
- **Security:** Hard-code `store_id` và `product_id` để verify license thuộc đúng product
- **Graceful degradation:** Network error không lock user ra khỏi premium features

Xem chi tiết setup tại `PAYMENT_SETUP.md`.

---

## 9. Rủi ro & Giải pháp

| Rủi ro                                     | Mức độ     | Giải pháp                                                            |
| ------------------------------------------ | ---------- | -------------------------------------------------------------------- |
| Không detect đúng article trên một số site | Trung bình | Dùng Mozilla Readability lib + cho phép user manual select           |
| Conflict với website CSS/JS                | Thấp       | Dùng Shadow DOM hoặc iframe cho UI elements, z-index cao             |
| Performance impact khi scroll              | Thấp       | Dùng `passive: true` event listener, requestAnimationFrame, throttle |
| Khó monetize trực tiếp                     | Cao        | Chấp nhận làm free tool → funnel sang paid products                  |
| Cạnh tranh nếu browser tích hợp native     | Thấp       | Chrome/Edge chưa có kế hoạch này; Firefox Reader Mode khác concept   |

---

## 10. Tại sao nên build extension này

### Pros

- Build cực nhanh — MVP 3-5 ngày, không cần backend
- Chi phí $0 — không server, không API, tất cả chạy local
- Dễ viral — utility nhỏ, ai cũng cần, dễ recommend cho người khác
- Portfolio piece — chứng minh bạn biết build Chrome extension
- Funnel — users biết đến bạn → upsell các extension premium khác
- Học Chrome Extension development — project nhỏ vừa đủ để master APIs

### Cons

- Khó monetize trực tiếp (utility quá nhỏ để charge)
- Doanh thu trực tiếp thấp → nên coi như marketing tool

### Kết luận

ReadMeter bắt đầu là một free tool để thu hút users nhanh. Với LemonSqueezy integration, extension có thể chuyển sang freemium model khi đạt đủ user base (10K+). Free tier vẫn giữ đầy đủ core features, premium tier cung cấp reading history, goals, export và sync — những tính năng mà power users sẵn sàng trả tiền.
