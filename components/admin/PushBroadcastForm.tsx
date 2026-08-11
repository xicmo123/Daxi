"use client";

import { useEffect, useState } from "react";
import { PUSH_TOPICS, PUSH_TOPIC_LABELS, type PushTopic } from "@/lib/pushTopics";

type Stats = { configured: boolean; devices: number; byTopic: Record<string, number> };

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #dfd1bf",
  background: "#fffaf1",
  color: "#2f261f",
  fontSize: 14,
};

export default function PushBroadcastForm() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topic, setTopic] = useState<PushTopic>("outage");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [path, setPath] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/push")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data));
  }, []);

  const recipients = stats?.byTopic?.[topic] ?? 0;

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    // A push is the one action in this backend that cannot be undone or
    // edited after the fact, so it gets a confirmation naming the audience.
    if (!window.confirm(`確定要發送給訂閱「${PUSH_TOPIC_LABELS[topic]}」的 ${recipients} 台裝置嗎？送出後無法收回。`)) {
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, title, body, path: path || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(data?.error ?? "發送失敗");
        return;
      }
      if (!data.configured) {
        setResult(`推播尚未設定憑證，未實際送出（目標 ${data.attempted} 台裝置）。請先設定 FCM_* 環境變數。`);
        return;
      }
      setResult(`已送出：${data.delivered}/${data.attempted} 台裝置${data.removed ? `，清除 ${data.removed} 個失效裝置` : ""}`);
      setTitle("");
      setBody("");
      setPath("");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {stats && !stats.configured ? (
        <div style={{ borderRadius: 10, padding: "10px 12px", background: "#fdf0e2", color: "#7a4b2c", fontSize: 13 }}>
          尚未設定 FCM 憑證，目前只會統計對象、不會實際發送。設定方式見 README「推播設定」。
        </div>
      ) : null}

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        通知類別
        <select value={topic} onChange={(e) => setTopic(e.target.value as PushTopic)} style={{ ...inputStyle, marginTop: 6 }}>
          {PUSH_TOPICS.map((t) => (
            <option key={t} value={t}>
              {PUSH_TOPIC_LABELS[t]}（{stats?.byTopic?.[t] ?? 0} 台）
            </option>
          ))}
        </select>
      </label>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        標題（{title.length}/60）
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          placeholder="例：8/6 上午 9 時 大溪區部分區域停水"
          style={{ ...inputStyle, marginTop: 6 }}
        />
      </label>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        內容（{body.length}/180）
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={180}
          rows={3}
          placeholder="例：影響範圍為一德里、美華里，預計下午 5 時復水。"
          style={{ ...inputStyle, marginTop: 6, resize: "vertical" }}
        />
      </label>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        點擊後開啟的頁面（選填）
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/resident/outages"
          style={{ ...inputStyle, marginTop: 6 }}
        />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="submit"
          disabled={sending || !title.trim() || !body.trim()}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "10px 18px",
            background: sending ? "#c8b6a0" : "#a06a3a",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: sending ? "default" : "pointer",
          }}
        >
          {sending ? "發送中…" : `發送給 ${recipients} 台裝置`}
        </button>
        {result ? <span style={{ fontSize: 13, color: "#5c4736" }}>{result}</span> : null}
      </div>
    </form>
  );
}
