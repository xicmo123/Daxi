"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Identity } from "@/lib/identity";

// Iris-style transition: a circle pops open from the center of the screen
// (day↔night wipe) with a springy ease-out-back overshoot, then the whole
// wash fades once the destination page has taken over underneath — warm
// tones toward tourist, cool tones toward resident.
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
          className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              background: gradient,
              width: "300vmax",
              height: "300vmax",
              left: "50%",
              top: "50%",
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 15, mass: 0.9 }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
