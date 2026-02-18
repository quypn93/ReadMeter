# ReadMeter — LemonSqueezy Payment Setup Guide

Hướng dẫn chi tiết cách thiết lập LemonSqueezy để thu phí Premium cho ReadMeter.

---

## 1. Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────────┐
│                    READMETER EXTENSION                       │
│                                                              │
│  ┌─────────┐     ┌──────────────┐     ┌──────────────────┐  │
│  │  Popup   │────▶│ Background   │────▶│ LemonSqueezy API │  │
│  │  UI      │◀────│ Service      │◀────│ License API      │  │
│  │          │     │ Worker       │     │                  │  │
│  └─────────┘     └──────────────┘     └──────────────────┘  │
│       │                │                       │             │
│       │ Show/hide      │ chrome.alarms         │ HTTPS       │
│       │ premium UI     │ validate 1x/day       │ POST        │
│       ▼                ▼                       ▼             │
│  ┌─────────┐     ┌──────────────┐     ┌──────────────────┐  │
│  │ License  │     │ chrome       │     │ Endpoints:       │  │
│  │ Input    │     │ .storage     │     │ /activate        │  │
│  │ Form     │     │ .local       │     │ /validate        │  │
│  └─────────┘     └──────────────┘     │ /deactivate      │  │
│                                       └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  LEMONSQUEEZY DASHBOARD                       │
│                                                              │
│  Store → Product → Variant → License Keys                    │
│                                                              │
│  Checkout Page ─── User pays ─── License key sent via email  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Tạo tài khoản LemonSqueezy

### Step 1: Đăng ký

1. Truy cập https://lemonsqueezy.com
2. Click **"Get started free"**
3. Đăng ký bằng email
4. Xác minh email

### Step 2: Tạo Store

1. Vào Dashboard → **Store** → nhập tên store (ví dụ: "ReadMeter Tools")
2. Upload logo store
3. Điền thông tin thuế/kinh doanh (LemonSqueezy là Merchant of Record, họ xử lý thuế)

### Step 3: Kết nối thanh toán

1. Dashboard → **Settings** → **Payments**
2. Kết nối Stripe hoặc PayPal để nhận tiền
3. LemonSqueezy thu phí 5% + $0.50/giao dịch, phần còn lại chuyển cho bạn

---

## 3. Tạo Product trên LemonSqueezy

### Step 1: Tạo Product

1. Dashboard → **Products** → **New Product**
2. Điền thông tin:

| Field         | Value                                            |
| ------------- | ------------------------------------------------ |
| Name          | ReadMeter Premium                                |
| Description   | Unlock reading history, goals, export, sync, and custom themes for ReadMeter Chrome Extension. |
| Pricing       | Chọn **Subscription** hoặc **One-time**          |

### Step 2: Cấu hình giá

**Option A: Subscription (khuyến nghị)**

| Plan          | Giá       | Billing      |
| ------------- | --------- | ------------ |
| Monthly       | $2.99/mo  | Hàng tháng   |
| Yearly        | $19.99/yr | Hàng năm     |

**Option B: One-time (Lifetime)**

| Plan          | Giá     |
| ------------- | ------- |
| Lifetime      | $29.99  |

### Step 3: Bật License Keys

1. Trong product settings → **License Keys** section
2. Toggle **"Enable license keys"** = ON
3. Cấu hình:

| Setting                | Value    | Lý do                                          |
| ---------------------- | -------- | ----------------------------------------------- |
| Activation limit       | 3        | Cho phép cài trên 3 thiết bị (PC + laptop + work) |
| License key length     | (mặc định) | LemonSqueezy tự generate UUID format          |
| License length (subscription) | (auto) | Tự động theo subscription lifecycle         |
| License length (one-time)     | null   | Perpetual / không hết hạn                    |

### Step 4: Lấy thông tin cần thiết

Sau khi tạo product, ghi lại các giá trị sau:

| Thông tin       | Nơi tìm                                    | Ví dụ                |
| --------------- | ------------------------------------------ | -------------------- |
| **Store ID**    | Dashboard → Settings → Store               | `12345`              |
| **Product ID**  | Products → click product → URL bar         | `67890`              |
| **Variant ID**  | Products → Variants tab                    | `11111`              |
| **Checkout URL**| Products → Share → Checkout Link           | `https://yourstore.lemonsqueezy.com/checkout/buy/readmeter-premium` |

---

## 4. Cấu hình trong Extension

### Step 1: Cập nhật `utils/license.js`

Mở file `utils/license.js` và thay thế các giá trị trong object `CONFIG`:

```javascript
var CONFIG = {
  // ← Thay bằng Store ID thực
  storeId: 12345,

  // ← Thay bằng Product ID thực
  productId: 67890,

  // ← Thay bằng Checkout URL thực
  checkoutUrl: 'https://yourstore.lemonsqueezy.com/checkout/buy/readmeter-premium',

  // Giữ nguyên
  apiBase: 'https://api.lemonsqueezy.com/v1/licenses',
  validateIntervalMinutes: 60 * 24,
  alarmName: 'readmeter-license-validate'
};
```

### Step 2: Verify cấu hình

Kiểm tra lại:

- [ ] `storeId` đúng (số, không phải string)
- [ ] `productId` đúng
- [ ] `checkoutUrl` mở được trong browser và hiển thị trang checkout
- [ ] Product trên LemonSqueezy đã enable license keys

---

## 5. License API Reference

### 5.1 Activate License

Gọi khi user nhập license key lần đầu.

```
POST https://api.lemonsqueezy.com/v1/licenses/activate

Headers:
  Accept: application/json
  Content-Type: application/x-www-form-urlencoded

Body:
  license_key=XXXX-XXXX-XXXX-XXXX
  instance_name=ReadMeter Chrome Extension
```

**Response thành công:**
```json
{
  "activated": true,
  "license_key": {
    "id": 1,
    "status": "active",
    "key": "38b1460a-5104-4067-a91d-77b872934d51",
    "activation_limit": 3,
    "activation_usage": 1,
    "expires_at": null
  },
  "instance": {
    "id": "f90ec370-fd83-46a5-8bbd-44a241e78665",
    "name": "ReadMeter Chrome Extension"
  },
  "meta": {
    "store_id": 12345,
    "product_id": 67890,
    "customer_email": "user@example.com"
  }
}
```

**Lưu ý quan trọng:** Phải lưu `instance.id` — cần cho validate và deactivate.

### 5.2 Validate License

Gọi định kỳ 1 lần/ngày để kiểm tra license còn hợp lệ không.

```
POST https://api.lemonsqueezy.com/v1/licenses/validate

Body:
  license_key=XXXX-XXXX-XXXX-XXXX
  instance_id=f90ec370-fd83-46a5-8bbd-44a241e78665
```

**Response:**
```json
{
  "valid": true,
  "license_key": {
    "status": "active",
    "expires_at": "2027-02-18T00:00:00.000000Z"
  }
}
```

**License status values:**
- `active` — hợp lệ, đang sử dụng
- `expired` — hết hạn (subscription không gia hạn)
- `disabled` — bị vô hiệu hóa thủ công từ dashboard

### 5.3 Deactivate License

Gọi khi user muốn chuyển thiết bị hoặc gỡ cài đặt.

```
POST https://api.lemonsqueezy.com/v1/licenses/deactivate

Body:
  license_key=XXXX-XXXX-XXXX-XXXX
  instance_id=f90ec370-fd83-46a5-8bbd-44a241e78665
```

Deactivate chỉ xóa **instance** cụ thể, license key vẫn có thể activate lại trên thiết bị khác.

### Rate Limits

- 60 requests/phút cho tất cả License API endpoints
- Extension chỉ gọi: 1 lần khi activate + 1 lần/ngày validate → rất xa limit

---

## 6. Flow chi tiết trong Extension

### 6.1 User mua Premium

```
1. User click "Get Premium" trong popup
2. popup.js gửi message { type: 'openCheckout' } đến background
3. background/service-worker.js mở tab mới: chrome.tabs.create({ url: checkoutUrl })
4. User hoàn tất thanh toán trên LemonSqueezy checkout
5. LemonSqueezy gửi email chứa license key cho user
6. User copy license key từ email
```

### 6.2 User activate license key

```
1. User paste key vào input trong popup
2. Click "Activate" hoặc nhấn Enter
3. popup.js gửi message { type: 'activateLicense', licenseKey: '...' }
4. background/service-worker.js gọi ReadMeterLicense.activate()
5. utils/license.js gọi POST /v1/licenses/activate
6. Nếu thành công:
   a. Verify store_id và product_id khớp
   b. Lưu licenseKey, instanceId, customerEmail vào chrome.storage.local
   c. Tạo Chrome alarm để validate 1 lần/ngày
   d. Popup chuyển sang hiển thị "Premium Active"
7. Nếu thất bại:
   a. Hiển thị error message (ví dụ: "Key invalid", "Activation limit reached")
```

### 6.3 Background validation (tự động)

```
1. Chrome alarm trigger mỗi 24 giờ
2. background/service-worker.js → ReadMeterLicense.handleAlarm()
3. Gọi POST /v1/licenses/validate với license_key + instance_id
4. Nếu valid: cập nhật lastValidated timestamp
5. Nếu invalid (expired/disabled): set licenseStatus = 'expired'/'disabled'
6. Nếu network error: KHÔNG thay đổi status (graceful degradation)
7. Lần tiếp theo user mở popup → kiểm tra status → lock/unlock premium UI
```

### 6.4 User deactivate license

```
1. User click "Deactivate License" trong popup
2. popup.js gửi message { type: 'deactivateLicense' }
3. background gọi POST /v1/licenses/deactivate
4. Xóa license data khỏi chrome.storage.local
5. Xóa Chrome alarm
6. Popup chuyển về hiển thị upsell UI
7. User có thể activate key này trên thiết bị khác
```

---

## 7. Bảo mật

### 7.1 Verify product ownership

Trong `utils/license.js`, extension hard-code `storeId` và `productId`. Mỗi khi activate hoặc validate, kiểm tra response `meta.store_id` và `meta.product_id` khớp. Điều này ngăn chặn việc dùng license key từ sản phẩm LemonSqueezy khác.

### 7.2 Activation limit

Set activation limit = 3 trên LemonSqueezy dashboard. Một license key chỉ có thể activate trên tối đa 3 thiết bị. Nếu user muốn cài trên thiết bị mới, phải deactivate một thiết bị cũ trước.

### 7.3 Graceful degradation

Khi validate thất bại do **network error** (không phải license invalid):
- KHÔNG lock user khỏi premium features
- Giữ nguyên status hiện tại
- Thử lại lần tiếp theo (24h sau)

Chỉ lock premium khi API trả về rõ ràng `valid: false`.

### 7.4 Hạn chế (client-side)

Vì tất cả logic chạy client-side trong extension, một user có kỹ thuật có thể:
- Mock API responses
- Sửa chrome.storage.local trực tiếp

Đây là trade-off chấp nhận được cho extension nhỏ. Nếu cần bảo mật cao hơn:
- Thêm backend proxy verify license
- Sign response từ backend
- Nhưng phần lớn users sẽ không làm vậy, và cost/benefit không đáng cho extension $2-3/tháng

---

## 8. Quản lý Customers

### Dashboard LemonSqueezy

Truy cập https://app.lemonsqueezy.com → **Customers** để:

- Xem danh sách tất cả khách hàng
- Xem license keys đã cấp
- Xem activation instances (thiết bị nào đang dùng)
- Disable/enable license keys thủ công
- Tạo license key thủ công (cho giveaway, beta testers)
- Xem revenue, MRR, churn rate

### Xử lý support thường gặp

| Vấn đề                      | Cách xử lý                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| "Tôi mất license key"       | Tìm theo email trong Dashboard → gửi lại key                |
| "Activation limit reached"  | Dashboard → License → tăng limit hoặc deactivate instance cũ |
| "Key expired"               | Kiểm tra subscription status, hướng dẫn gia hạn              |
| Refund request              | Dashboard → Order → Refund (key tự động bị disabled)         |
| "Tôi đổi máy tính"         | Hướng dẫn deactivate trong extension cũ, activate lại máy mới |

---

## 9. Webhooks (nâng cao, optional)

LemonSqueezy hỗ trợ webhooks để notify khi có events. Cần có backend server để nhận.

### Webhook events hữu ích

| Event                        | Dùng để                                  |
| ---------------------------- | ---------------------------------------- |
| `order_created`              | Log new purchase                         |
| `subscription_expired`       | Gửi email nhắc gia hạn                  |
| `subscription_cancelled`     | Log churn                                |
| `license_key_updated`        | Sync license status changes              |

### Setup

1. Dashboard → **Settings** → **Webhooks**
2. Thêm endpoint URL (ví dụ: `https://your-server.com/api/webhooks/lemonsqueezy`)
3. Chọn events cần listen
4. Verify webhook signature bằng signing secret

**Lưu ý:** Webhooks là optional. Extension hoạt động hoàn toàn mà không cần webhooks vì đã có periodic license validation.

---

## 10. Testing

### Test flow đầy đủ

1. **Tạo test product** trên LemonSqueezy (set giá $0 hoặc dùng test mode)
2. **Mua thử** → nhận license key
3. **Activate** trong extension → kiểm tra premium UI
4. **Validate** → chờ alarm hoặc trigger thủ công
5. **Deactivate** → kiểm tra quay về free UI
6. **Test edge cases:**
   - License key sai format → hiển thị error
   - License key hết hạn → lock premium
   - Network offline → không crash, giữ status cũ
   - Activation limit vượt → hiển thị lỗi rõ ràng

### Test trong Console

Mở extension popup → F12 → Console:

```javascript
// Kiểm tra license status hiện tại
chrome.storage.local.get('readmeterLicense', console.log);

// Xóa license (để test lại từ đầu)
chrome.storage.local.remove('readmeterLicense');
```

---

## 11. Checklist trước khi Go Live

- [ ] Tài khoản LemonSqueezy đã verified
- [ ] Product đã tạo với đúng giá và mô tả
- [ ] License keys đã enable với activation limit = 3
- [ ] `storeId` trong `utils/license.js` đúng
- [ ] `productId` trong `utils/license.js` đúng
- [ ] `checkoutUrl` trong `utils/license.js` đúng và mở được
- [ ] Test mua + activate + validate + deactivate thành công
- [ ] Error messages hiển thị đúng cho các trường hợp lỗi
- [ ] Popup UI hiển thị đúng ở cả 2 state (free / premium)
- [ ] License data được lưu đúng trong chrome.storage.local
- [ ] Chrome alarm chạy đúng (validate 1 lần/ngày)
- [ ] Network error không crash extension
