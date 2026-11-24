"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AboutModal from "./AboutModal";
import { ABOUT_HREF } from "@/lib/aboutOwner";
import { tapLight } from "@/lib/haptics";

function isAboutLink(target: EventTarget | null): boolean {
  const anchor = target instanceof Element ? target.closest("a[href]") : null;
  const href = anchor?.getAttribute("href") ?? "";
  return href === ABOUT_HREF || href.endsWith(`/${ABOUT_HREF}`);
}

// Mounted once in the root layout. Any link to "#about" — bottom-nav tab,
// menu, footer, guide card — opens the 關於 popup in place instead of
// navigating, and the old /about pages redirect to "<home>#about".
export default function AboutModalHost() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const resident = pathname.startsWith("/resident");

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash !== ABOUT_HREF) return;
      setOpen(true);
      // Drop the hash so closing and reloading don't reopen it.
      history.replaceState(history.state, "", window.location.pathname + window.location.search);
    };
    // Capture phase, so the link's own navigation is cancelled before Next's
    // <Link> handler sees the click (it skips defaultPrevented events). The
    // link's other handlers, like closing the menu, still run.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!isAboutLink(e.target)) return;
      e.preventDefault();
      tapLight();
      setOpen(true);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return open ? <AboutModal resident={resident} onClose={() => setOpen(false)} /> : null;
}
