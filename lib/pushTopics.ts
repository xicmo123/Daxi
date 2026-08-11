// Push topic vocabulary. Pure data and types — no server-only imports, so
// client components can import it directly.
//
// Split out of lib/pushTokens.ts, which reads and writes data/push-tokens.json
// and therefore imports `fs` through lib/jsonStore.ts. components/
// NotificationSettings.tsx only needs the labels, but importing them from
// pushTokens dragged the whole file-system module into the browser bundle and
// failed the production build outright. Same reasoning as lib/daxiVillages.ts.
export const PUSH_TOPICS = ["outage", "roadwork", "garbage", "announcement", "event"] as const;
export type PushTopic = (typeof PUSH_TOPICS)[number];

export const PUSH_TOPIC_LABELS: Record<PushTopic, string> = {
  outage: "停水停電",
  roadwork: "道路施工",
  garbage: "垃圾清運",
  announcement: "區公所公告",
  event: "活動與節慶",
};

export function isPushTopic(value: unknown): value is PushTopic {
  return typeof value === "string" && (PUSH_TOPICS as readonly string[]).includes(value);
}
