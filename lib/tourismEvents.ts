// 交通部觀光署「活動 - 觀光資訊資料庫」開放資料 — a nationwide events zip,
// refreshed daily by the Tourism Administration. No API key needed. Same
// fetch-a-zip-and-unzip pattern as the Taipower outage feed in outages.ts.
import JSZip from "jszip";

const EVENT_ZIP_URL = "https://media.taiwan.net.tw/XMLReleaseAll_public/v2.0/Zh_tw/Event-json.zip";
const EVENT_JSON_ENTRY = "EventList.json";

type RawEvent = {
  EventID: string;
  EventName: string;
  Description?: string;
  PostalAddress?: { City?: string; Town?: string };
  Images?: Array<{ URL?: string }>;
  WebsiteURL?: string;
  SameAsURLs?: string[];
  StartDateTime?: string;
  EndDateTime?: string;
};

type RawEventFile = { Events: RawEvent[] };

export type TourismEvent = {
  id: string;
  title: string;
  desc: string;
  startDate: string | null;
  endDate: string | null;
  photoSrc?: string;
  ctaUrl?: string;
};

// Refetched every 6h — the source itself only updates once a day, so this
// is just about not re-downloading/unzipping on every request.
export async function fetchDaxiTourismEvents(): Promise<TourismEvent[]> {
  const res = await fetch(EVENT_ZIP_URL, { next: { revalidate: 21600 } });
  if (!res.ok) throw new Error(`Tourism event feed responded ${res.status}`);

  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const entry = zip.file(EVENT_JSON_ENTRY);
  if (!entry) throw new Error(`${EVENT_JSON_ENTRY} missing from Tourism event feed zip`);

  const text = (await entry.async("text")).replace(/^﻿/, "");
  const data = JSON.parse(text) as RawEventFile;

  return data.Events.filter((e) => e.PostalAddress?.City === "桃園市" && (e.PostalAddress?.Town ?? "").startsWith("大溪")).map(
    (e): TourismEvent => ({
      id: e.EventID,
      title: e.EventName,
      desc: e.Description ?? "",
      startDate: e.StartDateTime ?? null,
      endDate: e.EndDateTime ?? null,
      photoSrc: e.Images?.[0]?.URL,
      ctaUrl: e.WebsiteURL || e.SameAsURLs?.[0],
    }),
  );
}
