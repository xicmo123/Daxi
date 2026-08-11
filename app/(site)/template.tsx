"use client";

// A short cross-fade + lift on every tourist-side navigation.
//
// template.tsx (not layout.tsx) is what makes this work: a layout instance is
// preserved across sibling routes, so its children change without the layout
// remounting and no enter animation ever runs. A template remounts per
// navigation, which is exactly the hook an enter transition needs.
//
// Deliberately 180ms and a 6px rise: enough that a tab switch feels like a
// screen change rather than a redraw, short enough that it never stands
// between the user and a live parking number.
import { motion } from "framer-motion";

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
