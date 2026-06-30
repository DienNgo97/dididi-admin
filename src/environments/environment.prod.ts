// Cấu hình môi trường PRODUCTION. Đổi `apiBase` thành URL backend thật khi deploy.
// (Để trống '' nếu FE và BE cùng origin / dùng reverse-proxy.)
export const environment = {
  production: true,
  apiBase: 'http://localhost:8080'
};
