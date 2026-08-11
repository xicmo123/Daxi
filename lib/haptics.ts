"use client";

// Tactile feedback for taps that change what's on screen.
//
// It is one of the few signals that separates "an app" from "a website in a
// webview" without any visual change at all — a tab switch that answers back
// under the thumb reads as native even when the pixels are identical.
//
// Every call is fire-and-forget: on the web there is no haptic engine, on a
// device with the Taptic Engine disabled the bridge rejects, and neither is
// worth an error path at the call site.
import { Capacitor } from "@capacitor/core";
import { ImpactStyle } from "@capacitor/haptics";

function run(fn: () => Promise<unknown>): void {
  if (!Capacitor.isNativePlatform()) return;
  void fn().catch(() => {});
}

/** Tab switches, chip toggles, list taps — the common case. */
export function tapLight(): void {
  run(async () => {
    const { Haptics } = await import("@capacitor/haptics");
    return Haptics.impact({ style: ImpactStyle.Light });
  });
}

/** Something committed: a coupon redeemed, a booking confirmed. */
export function tapSuccess(): void {
  run(async () => {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    return Haptics.notification({ type: NotificationType.Success });
  });
}

/** A refresh completed, a sheet snapped shut — a touch heavier than Light. */
export function tapMedium(): void {
  run(async () => {
    const { Haptics } = await import("@capacitor/haptics");
    return Haptics.impact({ style: ImpactStyle.Medium });
  });
}
