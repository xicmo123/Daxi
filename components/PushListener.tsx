"use client";

// Routes a tapped push to the page it is about.
//
// Without this, tapping "8/6 大溪區部分區域停水" just opens the app on whatever
// screen it was last on, and the resident has to go find the outage list
// themselves — which is most of the value of the notification gone.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export default function PushListener() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let remove: (() => void) | undefined;

    // Imported lazily so the plugin never loads in the browser build.
    void import("@capacitor/push-notifications").then(({ PushNotifications }) => {
      void PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const path = action.notification.data?.path;
        // Only in-app paths: a push payload is attacker-controlled if the FCM
        // credentials ever leak, and following an absolute URL from it would
        // turn that into an open redirect inside the app's own webview.
        if (typeof path === "string" && path.startsWith("/") && !path.startsWith("//")) {
          router.push(path);
        }
      }).then((handle) => {
        remove = () => void handle.remove();
      });
    }).catch(() => {
      // Older shells have no push plugin; nothing to route, and an unhandled
      // rejection here would be reported as a client error on every launch.
    });

    return () => remove?.();
  }, [router]);

  return null;
}
