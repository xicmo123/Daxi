"use client";

import ErrorScreen from "@/components/ErrorScreen";

export default function MerchantError({
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
      title="商家後台出了點問題"
      description="請重新載入。若正在核銷優惠券，請先確認顧客的核銷碼仍在有效期內再重試。"
      homeHref="/merchant"
    />
  );
}
