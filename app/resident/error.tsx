"use client";

import ErrorScreen from "@/components/ErrorScreen";

// Resident pages carry the civic-emergency content (停水停電, AED, 診所輪值),
// so this boundary keeps 110/119 one tap away even while the page is broken.
export default function ResidentError({
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
      description="可能是網路不穩，或區公所／台電／台水的資料來源暫時無回應。緊急狀況請直接撥打下方電話。"
      showEmergency
      homeHref="/resident"
    />
  );
}
