# ReadMeter — Chrome Web Store Submission Guide

Tài liệu hướng dẫn chuẩn bị và submit extension lên Chrome Web Store.

---

## 1. Thông tin tài khoản Developer

### Đăng ký Chrome Web Store Developer Account

- **URL:** https://chrome.google.com/webstore/devconsole/
- **Phí đăng ký:** $5 USD (một lần duy nhất)
- **Yêu cầu:** Tài khoản Google

### Thông tin cần chuẩn bị

| Field                | Value                                     |
| -------------------- | ----------------------------------------- |
| Developer name       | _(tên bạn hoặc tên công ty)_             |
| Developer email      | _(email công khai, sẽ hiển thị trên Store)_ |
| Developer website    | _(optional — link portfolio/GitHub)_       |

---

## 2. Store Listing — Thông tin hiển thị

### 2.1 Tên extension

```
ReadMeter — Read Time & Progress Bar
```

> Lưu ý: Tối đa 45 ký tự. Tên hiện tại = 38 ký tự.

### 2.2 Summary (Tóm tắt ngắn)

```
See estimated reading time and progress bar on any article. Know how long it takes before you start reading.
```

> Hiển thị trong search results. Tối đa 132 ký tự. Hiện tại = 106 ký tự.

### 2.3 Description (Mô tả đầy đủ)

```
ReadMeter automatically detects article content on any webpage and shows you:

📖 READING TIME — See "7 min read" at the top of any article, so you know exactly how long it takes before you start.

📊 PROGRESS BAR — A slim, elegant bar at the top of your browser fills as you scroll, showing exactly how far you've read.

⏱ TIME REMAINING — A floating indicator shows "43% · 4 min left" as you scroll, so you always know how much is left.

═══════════════════════════════

WHY READMETER?

• Medium shows "5 min read" on every article — now you get the same feature on EVERY website
• Perfect for research: quickly see how long each article takes and prioritize what to read first
• Great for students, knowledge workers, and anyone who reads articles online

═══════════════════════════════

FEATURES

✅ Auto-detect articles — Works on Medium, Substack, WordPress, news sites, blogs, and more
✅ Smart language detection — Adjusts reading speed for English, Vietnamese, Chinese, Japanese, Korean, and more
✅ Customizable — Change progress bar color, adjust reading speed, toggle features on/off
✅ Daily stats — Track how many articles you read and total minutes per day
✅ Lightweight — No external requests, no data collection, runs 100% locally
✅ Minimal UI — Only shows up when reading an actual article, never intrusive

═══════════════════════════════

SETTINGS

• Toggle read time badge on/off
• Toggle progress bar on/off
• Choose your progress bar color
• Set custom reading speed (100-400 words per minute)
• View today's reading statistics

═══════════════════════════════

PRIVACY

ReadMeter respects your privacy:
• ✅ No data collection — we don't track what you read
• ✅ No network requests — everything runs locally in your browser
• ✅ No account required — works immediately after installation
• ✅ Minimal permissions — only "storage" (for settings) and "activeTab"

═══════════════════════════════

SUPPORTED SITES

Works on virtually any website with article content:
• Medium, Substack, WordPress, Ghost, Hashnode
• Dev.to, CSS-Tricks, Smashing Magazine
• BBC, NY Times, The Verge, TechCrunch
• VnExpress, Tuoi Tre, and Vietnamese news sites
• Wikipedia, GitHub READMEs
• Any blog or news site with article content

═══════════════════════════════

FREE & OPEN SOURCE

ReadMeter is completely free with no premium tier, no ads, and no catches.

If you find it useful, please leave a ⭐ review — it helps others discover the extension!

For feedback or bug reports: https://github.com/quypn93/ReadMeter/issues
```

---

## 3. Assets cần chuẩn bị

### 3.1 Extension Icons (đã có)

| Size    | File              | Dùng cho                       |
| ------- | ----------------- | ------------------------------ |
| 16x16   | icons/icon-16.png | Toolbar icon                   |
| 48x48   | icons/icon-48.png | Extensions management page     |
| 128x128 | icons/icon-128.png| Chrome Web Store listing        |

### 3.2 Promotional Images (cần tạo)

| Asset                   | Size        | Mô tả                                         | Bắt buộc |
| ----------------------- | ----------- | ---------------------------------------------- | -------- |
| Small promo tile        | 440x280 px  | Hiển thị trên Store listing                    | Khuyến nghị |
| Large promo tile        | 920x680 px  | Featured trên Store homepage (nếu được chọn)   | Optional |
| Marquee promo tile      | 1400x560 px | Banner lớn khi được featured                    | Optional |

**Gợi ý nội dung cho promo tile:**
- Background: gradient xanh lá (#4CAF50 → #2E7D32)
- Text chính: "ReadMeter"
- Tagline: "Read Time & Progress for Every Article"
- Mock screenshot nhỏ cho thấy progress bar + badge trên một bài viết

### 3.3 Screenshots (bắt buộc — tối thiểu 1, tối đa 5)

Kích thước: **1280x800** hoặc **640x400** pixels

| # | Nội dung screenshot                                         | Ghi chú                          |
| - | ----------------------------------------------------------- | -------------------------------- |
| 1 | Progress bar + badge trên Medium article                    | Screenshot chính, nổi bật nhất   |
| 2 | Floating info "43% · 4 min left" đang hiển thị             | Cho thấy remaining time feature  |
| 3 | Popup settings đang mở                                      | Cho thấy customization options   |
| 4 | So sánh before/after (split screen)                         | Cho thấy giá trị extension mang lại |
| 5 | ReadMeter trên trang tin tức tiếng Việt (VnExpress)         | Cho thấy multi-language support  |

**Cách chụp screenshot chất lượng:**

1. Mở Chrome, set window size = 1280x800
2. Navigate đến trang cần chụp
3. Ẩn bookmark bar (Ctrl+Shift+B)
4. Ẩn các extension icons khác (chỉ để ReadMeter)
5. Dùng Chrome DevTools → Ctrl+Shift+P → "Capture full size screenshot"
6. Hoặc dùng extension "GoFullPage" để chụp

**Annotation tips:**
- Dùng Figma/Canva để thêm annotation arrows
- Highlight vùng badge và progress bar bằng border/circle đỏ
- Thêm text label giải thích từng feature
- Giữ style nhất quán giữa các screenshots

---

## 4. Category & Tags

### 4.1 Category

**Primary category:** `Productivity`

**Lý do:** ReadMeter giúp user đọc hiệu quả hơn, biết thời gian đọc trước, track tiến trình đọc.

### 4.2 Language

- Primary: English
- Additional: Vietnamese

### 4.3 Search Keywords (tự nhiên trong description)

Các keyword quan trọng đã nằm trong description:
- "read time"
- "reading time"
- "progress bar"
- "article"
- "estimated reading time"
- "min read"
- "Medium"
- "scroll progress"

> Chrome Web Store không có field "tags" riêng — keywords nằm trong title + description.

---

## 5. Privacy & Permissions

### 5.1 Privacy Policy

Chrome Web Store yêu cầu privacy practice disclosures. ReadMeter rất đơn giản:

**Single purpose description:**
```
ReadMeter displays estimated reading time and a scroll progress bar on article pages to help users manage their reading.
```

**Data usage disclosures (Chrome Web Store Developer Dashboard):**

| Question                                              | Answer          |
| ----------------------------------------------------- | --------------- |
| Does your extension collect personal data?            | No              |
| Does your extension sell personal data to third parties? | No           |
| Does your extension use or transfer personal data for purposes unrelated to the extension? | No |
| Does your extension use or transfer personal data to determine creditworthiness or for lending purposes? | No |

### 5.2 Permissions Justification

Khi submit, Chrome yêu cầu giải thích lý do dùng từng permission:

| Permission   | Justification text                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `storage`    | Used to save user preferences (reading speed, progress bar color, toggle states) and daily reading statistics. No personal data is stored. |
| `activeTab`  | Used to communicate with the content script on the active tab to display article information in the popup.        |

### 5.3 Content Scripts Justification

| Field                     | Value                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Match pattern             | `<all_urls>`                                                                              |
| Justification             | ReadMeter needs to run on all URLs because articles can be found on any website. The content script first checks if the page contains an article (300+ words) before injecting any UI elements. No data is collected or transmitted. |

### 5.4 Remote Code

| Question                                    | Answer |
| ------------------------------------------- | ------ |
| Does your extension execute remote code?    | No     |
| Does your extension use remotely hosted JS? | No     |

### 5.5 Privacy Policy URL (nếu cần)

Nếu Chrome Web Store yêu cầu privacy policy URL, tạo một trang đơn giản:

**Option A:** Tạo file `PRIVACY.md` trong GitHub repo → dùng URL raw GitHub

**Option B:** Nội dung privacy policy:

```
Privacy Policy for ReadMeter

Last updated: [DATE]

ReadMeter is a browser extension that displays reading time estimates
and progress bars on article pages.

DATA COLLECTION
ReadMeter does NOT collect, store, or transmit any personal data.
All data (user settings and daily reading statistics) is stored
locally in your browser using Chrome's storage API.

DATA STORED LOCALLY
- User preferences: reading speed, progress bar color, toggle states
- Daily statistics: number of articles detected, estimated total
  reading minutes (stored for 7 days, then automatically deleted)
- No URLs, article content, or browsing history is stored

NETWORK REQUESTS
ReadMeter makes ZERO network requests. The extension runs entirely
locally in your browser.

THIRD-PARTY SERVICES
ReadMeter does not use any third-party services, analytics, or
tracking tools.

PERMISSIONS
- "storage": To save your settings and daily stats locally
- "activeTab": To show article info in the extension popup

CONTACT
For questions about this privacy policy:
[YOUR EMAIL]
[YOUR GITHUB ISSUES URL]
```

---

## 6. Quy trình Submit

### Step 1: Chuẩn bị file ZIP

```bash
# Từ thư mục cha chứa ReadMeter/
cd ReadMeter

# Tạo file zip (loại bỏ files không cần thiết)
zip -r ../readmeter-v1.0.0.zip . \
  -x ".git/*" \
  -x "generate_icons.py" \
  -x "*.md" \
  -x ".gitignore" \
  -x "node_modules/*"
```

File ZIP phải chứa:
```
readmeter-v1.0.0.zip
├── manifest.json
├── content/
│   ├── detector.js
│   ├── calculator.js
│   ├── progressbar.js
│   ├── badge.js
│   └── styles.css
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/
│   └── service-worker.js
├── utils/
│   └── language-detect.js
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── _locales/
    ├── en/messages.json
    └── vi/messages.json
```

### Step 2: Upload lên Developer Dashboard

1. Truy cập https://chrome.google.com/webstore/devconsole/
2. Click **"New Item"**
3. Upload file ZIP
4. Điền thông tin:
   - Store listing (title, description, screenshots)
   - Privacy practices
   - Distribution settings

### Step 3: Điền Store Listing

Dùng thông tin ở mục 2 ở trên để điền:
- **Title** (mục 2.1)
- **Summary** (mục 2.2)
- **Description** (mục 2.3)
- **Category:** Productivity
- **Language:** English (primary), Vietnamese (additional)
- Upload **screenshots** (mục 3.3)
- Upload **promo tiles** (mục 3.2) nếu có

### Step 4: Điền Privacy Practices

Dùng thông tin ở mục 5:
- Single purpose description
- Data usage disclosures
- Permission justifications

### Step 5: Distribution Settings

| Setting                 | Value                        |
| ----------------------- | ---------------------------- |
| Visibility              | Public                       |
| Distribution regions    | All regions                  |
| Pricing                 | Free                         |

### Step 6: Submit for Review

1. Click **"Submit for Review"**
2. Thời gian review thông thường: **1-3 ngày làm việc**
3. Nếu bị reject, đọc kỹ lý do và fix issues

---

## 7. Lý do bị Reject thường gặp & Cách fix

| Lý do reject                        | Cách fix                                                            |
| ----------------------------------- | ------------------------------------------------------------------- |
| Missing permission justification    | Thêm giải thích chi tiết cho mỗi permission (mục 5.2)              |
| `<all_urls>` too broad              | Giải thích rõ tại sao cần chạy trên all URLs (mục 5.3)             |
| Missing privacy policy              | Tạo privacy policy page (mục 5.5)                                  |
| Screenshots không rõ ràng           | Chụp lại screenshots chất lượng hơn, thêm annotation                |
| Description misleading              | Đảm bảo description mô tả đúng chức năng thực tế                   |
| Remote code execution               | Đảm bảo không fetch JS từ remote server                              |
| Functionality not working           | Test kỹ trên nhiều sites trước khi submit (xem TESTING.md)          |

---

## 8. Sau khi Publish

### 8.1 Monitor & Respond

- [ ] Theo dõi reviews hàng ngày trong 2 tuần đầu
- [ ] Trả lời mọi review (đặc biệt negative reviews)
- [ ] Fix bugs được report ASAP
- [ ] Publish update trong vòng 48h nếu có critical bug

### 8.2 Marketing Channels

| Channel                | Action                                                     | Timing          |
| ---------------------- | ---------------------------------------------------------- | --------------- |
| Product Hunt           | Submit as a new product                                    | Ngày publish    |
| Reddit r/chrome        | Post giới thiệu extension                                 | Ngày publish    |
| Reddit r/productivity  | Post về use case                                           | Ngày publish +1 |
| r/InternetIsBeautiful  | Post nếu có demo page                                     | Tuần 1          |
| Indie Hackers          | Post building journey                                      | Tuần 1          |
| Hacker News            | "Show HN" post                                             | Tuần 1          |
| Dev.to                 | Viết bài "How I built a Chrome Extension in 5 days"        | Tuần 2          |
| Twitter/X              | Thread về quá trình build                                   | Tuần 1          |
| Facebook groups (VN)   | Chia sẻ trong các group dev/productivity                    | Tuần 1          |

### 8.3 Version Updates

| Version | Content                                     | Timeline   |
| ------- | ------------------------------------------- | ---------- |
| 1.0.0   | MVP — read time + progress bar + settings   | Now        |
| 1.1.0   | Bug fixes from user feedback                | +2 tuần    |
| 1.2.0   | Keyboard shortcut, dark mode support        | +1 tháng   |
| 2.0.0   | Reading history, daily goals, stats         | +2 tháng   |

---

## 9. Checklist tổng hợp trước khi Submit

### Code

- [ ] Manifest V3 valid
- [ ] Tất cả files trong ZIP đúng structure
- [ ] Không có console.log debug còn sót
- [ ] Không có TODO/FIXME comments
- [ ] Không có remote code execution
- [ ] Không có `eval()` hoặc unsafe code

### Assets

- [ ] Icon 16x16 (PNG)
- [ ] Icon 48x48 (PNG)
- [ ] Icon 128x128 (PNG)
- [ ] Screenshots (ít nhất 1, tối đa 5, 1280x800 hoặc 640x400)
- [ ] Promotional tile 440x280 (khuyến nghị)

### Store Listing

- [ ] Title (max 45 chars)
- [ ] Summary (max 132 chars)
- [ ] Description (đầy đủ, có formatting)
- [ ] Category: Productivity
- [ ] Language: English + Vietnamese

### Privacy

- [ ] Single purpose description
- [ ] Data usage disclosures (all "No")
- [ ] Permission justifications
- [ ] Privacy policy URL (nếu required)
- [ ] No remote code declaration

### Testing

- [ ] Smoke test pass (xem TESTING.md)
- [ ] Test trên ít nhất 10 websites
- [ ] Không có Console errors
- [ ] Performance OK
