// Cấu hình môi trường DEV (mặc định). Khi `ng build` ở production,
// file này được thay bằng `environment.prod.ts` qua `fileReplacements` (angular.json).
//
// apiBase TỰ NHẬN BIẾT nơi đang mở trang admin:
//   - Mở ở localhost (máy dev)      -> gọi backend localhost:8080 như bình thường.
//   - Mở qua tunnel/LAN (máy khác)  -> "localhost" trên máy đó KHÔNG có backend,
//                                      nên phải gọi địa chỉ công khai khai báo bên dưới.
// Nhờ vậy KHÔNG phải sửa đi sửa lại file này mỗi lần bật/tắt tunnel.
const isLocal =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.hostname === '[::1]';

/**
 * ĐỊA CHỈ BACKEND CÔNG KHAI — chỉ dùng khi mở admin từ máy khác (tunnel/LAN).
 * Dán URL tunnel của backend (cổng 8080) vào đây, KHÔNG có dấu "/" ở cuối.
 * Ví dụ: 'https://backend-abc.trycloudflare.com'
 * Để trống '' nếu chưa dùng tunnel.
 */
const PUBLIC_API_BASE = '';

export const environment = {
  production: false,
  apiBase: isLocal ? 'http://localhost:8080' : (PUBLIC_API_BASE || 'http://localhost:8080'),
};
