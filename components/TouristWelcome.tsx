"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { daxiWalkHref, oldStreetHistorySource, oldStreetPhoto, photoLicense } from "@/lib/daxiWalk";
import { readIdentity } from "@/lib/identity";
import Modal from "./ui/Modal";
import styles from "./TouristGuide.module.css";

const welcomeKey = "daxi-welcome-story-v1";
let seenInTab = false;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getWelcomeStatus() {
  if (readIdentity() === "resident") return "resident";
  if (seenInTab) return "seen";
  try {
    return window.localStorage.getItem(welcomeKey) === "seen" ? "seen" : "new";
  } catch {
    return "new";
  }
}

function getServerStatus() {
  return "pending";
}

export default function TouristWelcome({ className, label = "讀大溪的故事" }: { className?: string; label?: ReactNode } = {}) {
  const router = useRouter();
  const status = useSyncExternalStore(subscribe, getWelcomeStatus, getServerStatus);
  const [showStory, setShowStory] = useState<boolean | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "resident") router.replace("/resident");
  }, [router, status]);

  const markSeen = useCallback(() => {
    seenInTab = true;
    try {
      window.localStorage.setItem(welcomeKey, "seen");
    } catch {
      // Keep the dismissal for this tab when browser storage is unavailable.
    }
    setShowStory(false);
  }, []);

  const close = useCallback(() => {
    markSeen();
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, [markSeen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className ?? styles.heroSecondary}
        onClick={() => setShowStory(true)}
      >
        {label}
      </button>
      {status !== "resident" && (showStory ?? status === "new") ? (
        <Modal label="大溪的故事" onClose={close} className={styles.storyDialog}>
          <div className={styles.storyPhoto}>
            <Image src={oldStreetPhoto.src} alt={oldStreetPhoto.alt} fill sizes="(max-width: 550px) 94vw, 510px" />
            <button type="button" onClick={close} className={styles.storyClose} aria-label="關閉大溪的故事">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className={styles.storyBody}>
            <h2>從大漢溪碼頭<br />走到今日老街</h2>
            <p>從前，茶葉、樟腦和木材沿著大漢溪運送，大溪因此成為熱鬧的內陸商港。走上和平路，兩旁商號的山牆還留著西式柱飾和閩南吉祥圖案，記錄著那段繁華。</p>
            <div className={styles.storyActions}>
              <Link className={styles.primaryAction} href={daxiWalkHref} onNavigate={markSeen}>開始老街散步 <span aria-hidden>→</span></Link>
              <button className={styles.quietAction} type="button" onClick={close}>先逛首頁</button>
            </div>
            <div className={styles.credits}>
              <a href={oldStreetPhoto.sourceUrl} target="_blank" rel="noreferrer">攝影 {oldStreetPhoto.author}</a>
              <span aria-hidden> · </span>
              <a href={photoLicense} target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
              <span aria-hidden> · </span>
              <a href={oldStreetHistorySource} target="_blank" rel="noreferrer">歷史資料</a>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
