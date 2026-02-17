# ReadMeter — Testing Guide

Hướng dẫn kiểm thử extension ReadMeter trước khi publish lên Chrome Web Store.

---

## 1. Cài đặt Extension (Developer Mode)

1. Mở Chrome, truy cập `chrome://extensions/`
2. Bật **Developer mode** (góc trên bên phải)
3. Click **Load unpacked** → chọn thư mục `ReadMeter/`
4. Extension sẽ xuất hiện trong danh sách và icon hiển thị trên toolbar

**Kiểm tra:**
- [ ] Extension load không lỗi (không có error badge đỏ)
- [ ] Icon hiển thị đúng trên toolbar
- [ ] Click icon mở popup settings thành công

---

## 2. Test Article Detection

Mở từng trang dưới đây và kiểm tra xem ReadMeter có detect đúng bài viết không.

### 2.1 Các trang cần test

| #  | Website               | URL test                                                        | Loại              |
| -- | --------------------- | --------------------------------------------------------------- | ----------------- |
| 1  | Medium                | Bất kỳ bài viết nào trên medium.com                             | Blog platform     |
| 2  | Substack              | Bất kỳ bài viết nào trên *.substack.com                         | Newsletter        |
| 3  | WordPress blog        | Bất kỳ blog WordPress nào (kiểm tra .entry-content)             | Blog CMS          |
| 4  | Dev.to                | Bất kỳ bài viết nào trên dev.to                                 | Tech blog         |
| 5  | Wikipedia             | Bất kỳ trang Wikipedia nào                                      | Encyclopedia      |
| 6  | GitHub README         | Bất kỳ repo README trên github.com                              | Documentation     |
| 7  | VnExpress             | Bất kỳ bài viết trên vnexpress.net                              | News (Vietnamese) |
| 8  | Tuoi Tre              | Bất kỳ bài viết trên tuoitre.vn                                 | News (Vietnamese) |
| 9  | The Verge             | Bất kỳ bài viết trên theverge.com                               | Tech news         |
| 10 | TechCrunch            | Bất kỳ bài viết trên techcrunch.com                             | Tech news         |
| 11 | Hacker News (item)    | Mở một link bài viết từ news.ycombinator.com                    | Aggregator        |
| 12 | Reddit post           | Mở một text post dài trên reddit.com                            | Forum             |
| 13 | Notion public page    | Bất kỳ trang Notion public nào có nội dung dài                  | Documentation     |
| 14 | Ghost blog            | Bất kỳ blog Ghost nào                                           | Blog platform     |
| 15 | BBC News              | Bất kỳ bài viết trên bbc.com/news                               | News (English)    |
| 16 | NY Times              | Bất kỳ bài viết trên nytimes.com                                | News (English)    |
| 17 | CSS-Tricks            | Bất kỳ bài viết trên css-tricks.com                             | Tech blog         |
| 18 | Smashing Magazine     | Bất kỳ bài viết trên smashingmagazine.com                       | Tech blog         |
| 19 | Hashnode              | Bất kỳ bài viết trên hashnode.dev                               | Blog platform     |
| 20 | Personal blog (Hugo)  | Tìm bất kỳ blog Hugo/Jekyll nào                                 | Static site       |

### 2.2 Checklist cho mỗi trang

Với mỗi trang ở trên, kiểm tra:

- [ ] **Badge hiển thị** — "X min read" xuất hiện ở đầu bài viết
- [ ] **Badge vị trí đúng** — Nằm trong/trước nội dung bài viết, không đè lên element khác
- [ ] **Số phút hợp lý** — Ước tính thời gian đọc có vẻ đúng (so sánh với Medium nếu có)
- [ ] **Word count hợp lý** — Số từ hiển thị đúng (không đếm sidebar, menu, footer)
- [ ] **Progress bar hiển thị** — Thanh xanh 3px ở top trình duyệt
- [ ] **Progress bar hoạt động** — Fill dần khi scroll xuống, giảm khi scroll lên
- [ ] **Floating info** — Hiển thị "X% · Y min left" khi scroll, fade out sau 2s
- [ ] **Không detect sai** — Không hiển thị trên trang chủ, listing page, search page

---

## 3. Test Trang KHÔNG phải article

ReadMeter **không nên** hiển thị trên các trang này:

| #  | Loại trang           | URL test                     | Expected               |
| -- | -------------------- | ---------------------------- | ---------------------- |
| 1  | Google Search        | google.com/search?q=test     | Không hiển thị gì      |
| 2  | YouTube              | youtube.com                  | Không hiển thị gì      |
| 3  | Gmail                | mail.google.com              | Không hiển thị gì      |
| 4  | Google Docs          | docs.google.com              | Không hiển thị gì      |
| 5  | Facebook feed        | facebook.com                 | Không hiển thị gì      |
| 6  | Twitter/X feed       | x.com                        | Không hiển thị gì      |
| 7  | Amazon product       | amazon.com (product page)    | Không hiển thị gì      |
| 8  | E-commerce listing   | shopee.vn (listing page)     | Không hiển thị gì      |
| 9  | Web app (Figma)      | figma.com (editor)           | Không hiển thị gì      |
| 10 | Landing page ngắn    | Bất kỳ landing page < 300 từ | Không hiển thị gì      |

**Checklist:**
- [ ] Không có badge "X min read"
- [ ] Không có progress bar
- [ ] Không có floating info
- [ ] Không có lỗi trong console (F12 → Console)

---

## 4. Test Progress Bar

### 4.1 Accuracy test

1. Mở một bài viết dài (> 2000 từ)
2. Scroll từ đầu đến cuối bài
3. Kiểm tra:
   - [ ] Progress bar bắt đầu từ 0% khi ở đầu bài
   - [ ] Progress bar đạt 100% khi cuối bài viết (không phải cuối trang)
   - [ ] Phần trăm tăng đều, không nhảy đột ngột
   - [ ] "Done!" hiển thị khi đọc xong

### 4.2 Performance test

1. Mở bài viết rất dài (> 10,000 từ, ví dụ Wikipedia article dài)
2. Scroll nhanh lên xuống liên tục trong 10 giây
3. Kiểm tra:
   - [ ] Trang không bị lag/giật
   - [ ] Progress bar cập nhật mượt
   - [ ] Không có lỗi trong Console

### 4.3 Edge cases

- [ ] Bài viết có nhiều ảnh — thời gian đọc có cộng thêm cho ảnh
- [ ] Bài viết có code blocks — code blocks được tính vào word count
- [ ] Bài viết có embedded video — video không ảnh hưởng
- [ ] Trang có sticky header — progress bar không bị che
- [ ] Trang đã có progress bar riêng — ReadMeter bar vẫn hiển thị ở layer trên

---

## 5. Test Language Detection

| # | Ngôn ngữ    | Trang test                | Expected WPM |
| - | ----------- | ------------------------- | ------------ |
| 1 | English     | medium.com article        | ~238 WPM     |
| 2 | Vietnamese  | vnexpress.net article     | ~180 WPM     |
| 3 | Chinese     | zhihu.com article         | ~158 WPM     |
| 4 | Japanese    | qiita.com article         | ~193 WPM     |
| 5 | Korean      | velog.io article          | ~200 WPM     |

**Kiểm tra:**
- [ ] Badge hiển thị ngôn ngữ đúng trong popup (ví dụ: "EN", "VI")
- [ ] Thời gian đọc khác nhau rõ rệt giữa tiếng Anh và tiếng Việt cho cùng độ dài bài

---

## 6. Test Popup Settings

### 6.1 Mở popup

- [ ] Click icon extension → popup mở ra
- [ ] Hiển thị thông tin bài viết hiện tại (nếu đang ở article page)
- [ ] Hiển thị "No article detected" (nếu không phải article page)
- [ ] Click icon gear → mở settings panel

### 6.2 Test từng setting

| Setting         | Test action                          | Expected result                                  |
| --------------- | ------------------------------------ | ------------------------------------------------ |
| Enabled toggle  | Tắt OFF                             | Badge + progress bar biến mất ngay               |
| Enabled toggle  | Bật ON lại                           | Badge + progress bar xuất hiện lại               |
| Show Badge      | Tắt OFF                             | Badge biến mất, progress bar vẫn có              |
| Progress Bar    | Tắt OFF                             | Progress bar biến mất, badge vẫn có              |
| Bar Color       | Đổi sang màu đỏ                     | Progress bar đổi màu ngay lập tức                |
| Reading Speed   | Kéo slider sang 100 WPM             | Badge cập nhật: thời gian đọc tăng lên           |
| Reading Speed   | Kéo slider sang 400 WPM             | Badge cập nhật: thời gian đọc giảm xuống         |

### 6.3 Settings persistence

1. Thay đổi settings (ví dụ: đổi màu, tắt badge)
2. Đóng popup
3. Mở lại popup
4. Kiểm tra:
   - [ ] Tất cả settings được giữ nguyên
5. Đóng Chrome hoàn toàn, mở lại
6. Kiểm tra:
   - [ ] Settings vẫn được giữ nguyên (chrome.storage.sync)

---

## 7. Test Daily Stats

1. Mở popup → ghi nhận stats hiện tại
2. Mở 3 bài viết khác nhau (mỗi bài ở tab riêng)
3. Mở popup lại:
   - [ ] "Articles" tăng thêm 3
   - [ ] "min read" tăng tương ứng
4. Mở lại một trong 3 bài đã đọc:
   - [ ] Stats KHÔNG tăng thêm (deduplicate by URL)

---

## 8. Test Compatibility

### 8.1 Browser compatibility

- [ ] Google Chrome (latest stable)
- [ ] Google Chrome (latest beta — nếu có)
- [ ] Microsoft Edge (Chromium)
- [ ] Brave Browser
- [ ] Opera (Chromium)

### 8.2 OS compatibility

- [ ] Windows 10/11
- [ ] macOS
- [ ] Linux (Ubuntu/Fedora)

### 8.3 Screen sizes

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Ultra-wide (2560x1080)
- [ ] 4K display (3840x2160) — kiểm tra progress bar vẫn 3px, không quá mỏng

---

## 9. Test Error Handling

### 9.1 Console errors

1. Mở Developer Tools (F12) → Console
2. Navigate qua 10+ trang khác nhau
3. Kiểm tra:
   - [ ] Không có error từ ReadMeter trong Console
   - [ ] Không có uncaught exceptions
   - [ ] Không có permission warnings

### 9.2 Conflict với extensions khác

Test khi cài đồng thời:
- [ ] AdBlock/uBlock Origin — ReadMeter vẫn hoạt động
- [ ] Dark Reader — progress bar vẫn visible
- [ ] Grammarly — không conflict
- [ ] React DevTools — không conflict

### 9.3 Trang lỗi

- [ ] Trang 404 → không hiển thị ReadMeter
- [ ] Trang trống → không hiển thị ReadMeter
- [ ] Trang chỉ có ảnh → không hiển thị ReadMeter
- [ ] Trang PDF (trong browser) → không crash

---

## 10. Performance Benchmarks

Sử dụng Chrome DevTools Performance tab:

### 10.1 Memory

1. Mở Task Manager (Shift+Esc trong Chrome)
2. So sánh memory usage của tab có/không có ReadMeter:
   - [ ] Chênh lệch < 5MB

### 10.2 CPU

1. Mở Performance tab trong DevTools
2. Record 10 giây scroll:
   - [ ] ReadMeter scroll handler < 1ms per frame
   - [ ] Không gây frame drops (maintain 60fps)

### 10.3 Page load

1. Mở Network tab
2. Reload trang:
   - [ ] ReadMeter không tạo network requests
   - [ ] Content script inject time < 50ms

---

## 11. Security Checklist

- [ ] Extension không request permissions không cần thiết
- [ ] Không gửi data ra ngoài (không có fetch/XMLHttpRequest)
- [ ] Không inject script từ remote source
- [ ] Không sử dụng `eval()` hoặc `innerHTML` với user input
- [ ] Content Security Policy đúng trong manifest
- [ ] Không lưu sensitive data (chỉ lưu settings và stats)

---

## 12. Checklist trước khi Submit

- [ ] Tất cả test cases ở trên PASS
- [ ] Không có lỗi trong Console trên 20 trang test
- [ ] Performance đạt yêu cầu
- [ ] Settings hoạt động đúng
- [ ] Icons hiển thị đúng ở 3 sizes
- [ ] Manifest.json valid (dùng Chrome extension validator)
- [ ] _locales/en/messages.json và vi/messages.json đúng format
- [ ] README và SPEC documentation đầy đủ

---

## Quick Smoke Test (5 phút)

Nếu không có thời gian test đầy đủ, chạy qua nhanh:

1. [ ] Load extension → không lỗi
2. [ ] Mở Medium article → badge + progress bar hiển thị
3. [ ] Scroll xuống → progress bar fill + floating info hiển thị
4. [ ] Mở popup → settings hoạt động
5. [ ] Tắt extension → badge + bar biến mất
6. [ ] Mở Google homepage → không hiển thị gì
7. [ ] Mở VnExpress article → detect tiếng Việt đúng
8. [ ] Console không có errors
