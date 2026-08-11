"use client";

import ErrorScreen from "@/components/ErrorScreen";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <ErrorScreen
      error={error}
      retry={unstable_retry}
      title="後台這個畫面出錯了"
      description="資料可能正在被另一個編輯動作寫入，或檔案讀取失敗。請重試；若持續發生，檢查伺服器上的 data/ 目錄權限。"
      homeHref="/admin"
    />
  );
}
