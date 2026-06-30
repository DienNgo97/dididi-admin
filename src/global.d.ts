// Kiểu cho 3 hộp thoại toàn cục đăng ký trong ConfirmDialogComponent.
// Đặt ở .d.ts để mọi file (component & spec) đều thấy mà không cần import.
// Cho phép gọi `window.appConfirm(...)` thay vì `(window as any).appConfirm(...)`.
declare global {
  interface Window {
    appConfirm: (message: string) => Promise<boolean>;
    appPrompt: (message: string, def?: string) => Promise<string | null>;
    appAlert: (message: string) => Promise<void>;
  }
}

export {};
