"use client";

import confetti from "canvas-confetti";
import { tapSuccess } from "./haptics";

// Warm palette matching the tourist accent tones so the burst reads as
// "on-brand celebration" rather than generic default-green confetti.
const PALETTE = ["#c9553d", "#e0a458", "#4a7594", "#7a9e6b", "#f4d35e"];

export function fireConfetti() {
  if (typeof window === "undefined") return;

  // Fires before the reduced-motion bail-out on purpose: someone who has
  // turned animation off should still get the confirmation, just without the
  // burst. Haptics are an accessibility affordance here, not decoration.
  tapSuccess();

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const duration = 1100;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors: PALETTE,
      startVelocity: 45,
      scalar: 0.9,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors: PALETTE,
      startVelocity: 45,
      scalar: 0.9,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 60,
    spread: 90,
    origin: { y: 0.6 },
    colors: PALETTE,
    startVelocity: 38,
    scalar: 1,
  });
}
