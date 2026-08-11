// Registered device tokens for remote push.
//
// Deliberately holds nothing but the token, its platform and timestamps: no
// account, no location, no device name. A civic app broadcasting 停水/停電/
// 道路施工 to a whole district does not need to know which resident is which,
// and not collecting it is the cheapest possible answer to both the App Store
// privacy questionnaire and a future data request.
//
// Topic subscriptions live here too so a resident can take 垃圾車 alerts
// without 活動 spam — muting everything is otherwise the only lever they have.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";
// The vocabulary lives in its own module so client components can import the
// labels without pulling this file's `fs` dependency into the browser bundle.
import type { PushTopic } from "./pushTopics";

export { PUSH_TOPICS, PUSH_TOPIC_LABELS, isPushTopic, type PushTopic } from "./pushTopics";

const DATA_PATH = dataPath("push-tokens.json");

export type PushToken = {
  token: string;
  platform: "ios" | "android" | "web";
  topics: PushTopic[];
  registeredAt: string;
  lastSeenAt: string;
};

export async function readPushTokens(): Promise<PushToken[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return Array.isArray(data) ? (data as PushToken[]) : [];
}

/**
 * Register or refresh a device.
 *
 * Upsert rather than append: the OS hands out a new token after a reinstall
 * but reuses it across launches, so appending would grow the file without
 * bound and send every notification several times to the same phone.
 */
export async function upsertPushToken(input: {
  token: string;
  platform: PushToken["platform"];
  topics: PushTopic[];
}): Promise<void> {
  const now = new Date().toISOString();
  await mutateJsonList<PushToken, void>(DATA_PATH, (tokens) => {
    const existing = tokens.find((t) => t.token === input.token);
    if (existing) {
      const next = tokens.map((t) =>
        t.token === input.token ? { ...t, platform: input.platform, topics: input.topics, lastSeenAt: now } : t,
      );
      return { next, result: undefined };
    }
    return {
      next: [...tokens, { ...input, registeredAt: now, lastSeenAt: now }],
      result: undefined,
    };
  });
}

/** Drop a token the push provider reported as permanently invalid. */
export async function removePushToken(token: string): Promise<void> {
  await mutateJsonList<PushToken, void>(DATA_PATH, (tokens) => ({
    next: tokens.filter((t) => t.token !== token),
    result: undefined,
  }));
}

export async function tokensForTopic(topic: PushTopic): Promise<PushToken[]> {
  return (await readPushTokens()).filter((t) => t.topics.includes(topic));
}
