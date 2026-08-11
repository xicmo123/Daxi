"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { PUSH_TOPICS, PUSH_TOPIC_LABELS, type PushTopic } from "@/lib/pushTopics";
import { enablePush, pushAvailable, readTopics, syncTopics } from "@/lib/pushClient";
import { SectionLabel } from "./ui/Card";

const TOPIC_HINTS: Record<PushTopic, string> = {
  outage: "台水、台電公告影響大溪的停水停電",
  roadwork: "會影響通行的道路施工與交通管制",
  garbage: "垃圾車接近你設定的倒垃圾點時提醒",
  announcement: "區公所發布的新公告",
  event: "大溪大禧等在地活動與節慶提醒",
};

// localStorage and Capacitor.isNativePlatform() are both external stores, and
// both differ between the server render and the client. useSyncExternalStore is
// the sanctioned way to read one: getServerSnapshot pins the SSR output so
// there is no hydration mismatch, and the real value swaps in right after
// mount — without the effect-then-setState cascade. Same pattern as
// components/IdentityGate.tsx.
const EMPTY_TOPICS: PushTopic[] = [];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

// Cached so the snapshot is referentially stable between reads; returning a
// fresh array each time would make useSyncExternalStore loop forever.
let cachedRaw: string | null = null;
let cachedTopics: PushTopic[] = EMPTY_TOPICS;

function getTopicsSnapshot(): PushTopic[] {
  const raw = window.localStorage.getItem("daxi-push-topics");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedTopics = readTopics();
  }
  return cachedTopics;
}

function getServerTopicsSnapshot(): PushTopic[] {
  return EMPTY_TOPICS;
}

export default function NotificationSettings() {
  const storedTopics = useSyncExternalStore(subscribe, getTopicsSnapshot, getServerTopicsSnapshot);
  const [localTopics, setLocalTopics] = useState<PushTopic[] | null>(null);
  const [busy, setBusy] = useState(false);

  const topics = localTopics ?? storedTopics;
  const enabled = topics.length > 0;
  const available = useSyncExternalStore(
    () => () => {},
    () => pushAvailable(),
    () => true,
  );

  const turnOn = useCallback(async () => {
    setBusy(true);
    try {
      const result = await enablePush();
      if (result === "granted") {
        setLocalTopics(readTopics());
      } else if (result === "denied") {
        window.alert("通知權限被拒絕了。可以到手機的「設定 → 大溪通 → 通知」重新開啟。");
      } else {
        // "unsupported" on a device that reports as native means the installed
        // binary predates the push plugin — the web app updates with the
        // server, the shell only updates through the store. Sending this user
        // to Settings would have them hunting for a switch that isn't there.
        window.alert("這個版本的大溪通還不支援通知，請到 App Store / Play 商店更新後再試。");
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const toggle = async (topic: PushTopic) => {
    const next = topics.includes(topic) ? topics.filter((t) => t !== topic) : [...topics, topic];
    setLocalTopics(next);
    await syncTopics(next);
  };

  if (!available) {
    return (
      <div>
        <SectionLabel className="mb-2">通知設定</SectionLabel>
        <div className="rounded-2xl px-4 py-3.5 text-[13px]" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
          停水停電、道路施工等即時提醒需要在「大溪通」App 中開啟。
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel className="mb-2">通知設定</SectionLabel>

      {!enabled ? (
        <button
          type="button"
          onClick={turnOn}
          disabled={busy}
          className="w-full rounded-2xl px-4 py-4 text-left transition-opacity active:opacity-80 disabled:opacity-60"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>
            {busy ? "設定中…" : "開啟通知"}
          </div>
          <div className="mt-1 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
            停水停電、道路施工、區公所公告，發生時第一時間通知你
          </div>
        </button>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
          {PUSH_TOPICS.map((topic, index) => {
            const on = topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => void toggle(topic)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-opacity active:opacity-70"
                style={{ borderTop: index === 0 ? undefined : "1px solid var(--line)", minHeight: 56 }}
                aria-pressed={on}
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold" style={{ color: "var(--ink)" }}>
                    {PUSH_TOPIC_LABELS[topic]}
                  </span>
                  <span className="mt-0.5 block text-[12px]" style={{ color: "var(--ink-soft)" }}>
                    {TOPIC_HINTS[topic]}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors"
                  style={{ background: on ? "var(--accent)" : "var(--line)" }}
                >
                  <span
                    className="absolute top-[3px] h-6 w-6 rounded-full transition-all"
                    style={{ left: on ? 23 : 3, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
