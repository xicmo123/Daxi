"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Identity } from "@/lib/identity";

// Full-bleed color wash shown for an instant while switching identity —
// warm tones toward tourist, cool tones toward resident — so the jump
// between the two experiences reads as a deliberate transition.
export default function IdentityTransitionOverlay({ to }: { to: Identity | null }) {
  const gradient =
    to === "resident"
      ? "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)"
      : "linear-gradient(135deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)";

  return (
    <AnimatePresence>
      {to ? (
        <motion.div
          key="identity-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="fixed inset-0 z-[60] pointer-events-none"
          style={{ background: gradient }}
        />
      ) : null}
    </AnimatePresence>
  );
}
