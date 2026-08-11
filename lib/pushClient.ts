"use client";

// Device-side registration for remote push.
//
// Only runs inside the native shell: remote push on the web would need a
// service worker and VAPID keys, and this app has neither (there is no service
// worker at all — see the PWA note in README). Local notifications, which are
// what the garbage-truck alert uses, work on both and live in
// lib/notifications.ts.
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import type { PushTopic } from "./pushTopics";

const TOPICS_KEY = "daxi-push-topics";

/** Topics on by default once a resident opts in at all. */
const DEFAULT_TOPICS: PushTopic[] = ["outage", "roadwork", "announcement"];

export function readTopics(): PushTopic[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TOPICS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTopics(topics: PushTopic[]): void {
  try {
    window.localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  } catch {
    // Private browsing — the choice still applies for this session.
  }
}

export function pushAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

async function sendRegistration(token: string, topics: PushTopic[]): Promise<void> {
  await fetch("/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, platform: Capacitor.getPlatform(), topics }),
  }).catch(() => {
    // The token is re-sent on the next launch; a failed registration must not
    // surface as an error to a resident who just tapped "開啟通知".
  });
}

/**
 * Ask the OS for push permission and register the resulting token.
 *
 * Call from a user gesture (the toggle in 我的 → 通知設定), never on launch:
 * iOS grants exactly one prompt, and spending it before the user understands
 * what the alerts are for is how an app ends up permanently unable to warn
 * anyone about a water outage.
 */
export async function enablePush(topics: PushTopic[] = DEFAULT_TOPICS): Promise<"granted" | "denied" | "unsupported"> {
  if (!pushAvailable()) return "unsupported";

  // A shell built before @capacitor/push-notifications was added rejects here.
  // Reported as "unsupported" rather than "denied": the user did not refuse
  // anything, their app is simply too old, and telling them to go fix a
  // permission in Settings would send them looking for a switch that isn't
  // there.
  const status = await PushNotifications.requestPermissions().catch(() => null);
  if (!status) return "unsupported";
  if (status.receive !== "granted") return "denied";

  writeTopics(topics);

  // registration fires asynchronously after register() succeeds.
  await new Promise<void>((resolve) => {
    let settled = false;
    void PushNotifications.addListener("registration", (token) => {
      if (settled) return;
      settled = true;
      void sendRegistration(token.value, topics).then(resolve);
    });
    void PushNotifications.addListener("registrationError", () => {
      if (settled) return;
      settled = true;
      resolve();
    });
    void PushNotifications.register();
    // Don't leave the caller's spinner up forever if neither event arrives.
    setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, 8000);
  });

  return "granted";
}

/**
 * Push the current topic selection to the server for an already-registered
 * device. No-op when the device never granted permission.
 */
export async function syncTopics(topics: PushTopic[]): Promise<void> {
  writeTopics(topics);
  if (!pushAvailable()) return;

  const status = await PushNotifications.checkPermissions().catch(() => null);
  if (!status || status.receive !== "granted") return;

  void PushNotifications.addListener("registration", (token) => {
    void sendRegistration(token.value, topics);
  });
  await PushNotifications.register().catch(() => {});
}
