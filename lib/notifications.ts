"use client";

// One notification API for both targets.
//
// The garbage-truck alert used `new Notification(...)` directly. That works in
// a desktop browser and it works in Android's WebView, but iOS WKWebView does
// not implement the Web Notifications API at all — so inside the iOS app the
// single most useful resident feature ("垃圾車快到了") silently did nothing:
// `window.Notification` was undefined, the permission state resolved to
// "unsupported", and the UI just never fired.
//
// On native this now goes through @capacitor/local-notifications, which is a
// real OS notification — it fires with the app backgrounded, which the web API
// could never do inside a webview even where it exists.
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

export function notificationsSupported(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== "undefined" && typeof window.Notification !== "undefined";
}

export async function currentPermission(): Promise<NotificationPermissionState> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display === "granted") return "granted";
      if (display === "denied") return "denied";
      return "default";
    } catch {
      // Older shell without the plugin — fall through to the web API below.
    }
  }
  if (typeof window === "undefined" || typeof window.Notification === "undefined") return "unsupported";
  return window.Notification.permission as NotificationPermissionState;
}

/**
 * Ask for permission. Call this from a user gesture — both platforms only
 * allow one prompt ever, so asking on app launch (before the user knows what
 * the app is for) permanently burns the chance to ask at the right moment.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      if (display === "granted") return "granted";
      if (display === "denied") return "denied";
      return "default";
    } catch {
      // Older shell without the plugin — fall through to the web API below.
    }
  }
  if (typeof window === "undefined" || typeof window.Notification === "undefined") return "unsupported";
  const result = await window.Notification.requestPermission();
  return result as NotificationPermissionState;
}

/**
 * Fire a notification immediately.
 *
 * `id` replaces any earlier notification with the same id rather than stacking
 * a second copy — the truck can sit within range for several polls, and a
 * column of seven identical alerts is how a useful feature gets muted.
 */
export async function notifyNow(options: { id: number; title: string; body: string }): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            // Fires ~immediately; a bare schedule with no `at` is delivered now.
            schedule: { at: new Date(Date.now() + 100) },
          },
        ],
      });
      return;
    } catch {
      // Binary predates the plugin (the web app updates with the server, the
      // shell only updates through the store). Fall through to the web API,
      // which is what these installs were using anyway.
    }
  }

  if (typeof window === "undefined" || typeof window.Notification === "undefined") return;
  new window.Notification(options.title, {
    body: options.body,
    icon: "/icon-192.png",
    tag: `daxi-${options.id}`,
  });
}

/** Stable ids so repeat alerts of the same kind replace each other. */
export const NOTIFICATION_IDS = {
  garbageTruck: 1001,
} as const;
