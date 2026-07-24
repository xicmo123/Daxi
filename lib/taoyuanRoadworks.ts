const ROADWORKS_URL =
  "https://opendata.tycg.gov.tw/api/dataset/56c616fe-07d7-4b0c-bb75-e8f8cd75500a/resource/52de3762-1490-4a86-a074-0062d746873b/download";

export type Roadwork = {
  id: string;
  type: string;
  name: string;
  location: string;
  township: string;
  start: string | null;
  stop: string | null;
  contractor: string | null;
  points: Array<[number, number]>;
};

function textBetween(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
}

function parsePoints(shape: string): Array<[number, number]> {
  const matches = shape.match(/-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?/g) ?? [];
  return matches
    .map((pair): [number, number] | null => {
      const [a, b] = pair.split(",").map((value) => Number(value.trim()));
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      if (Math.abs(a) > 90) return [b, a];
      return [a, b];
    })
    .filter((point): point is [number, number] => point !== null);
}

function parseXml(xml: string): Roadwork[] {
  const rows = xml.match(/<(?:row|Row|record|Record|item|Item)>[\s\S]*?<\/(?:row|Row|record|Record|item|Item)>/g) ?? [];
  return rows
    .map((row, index): Roadwork | null => {
      const township = textBetween(row, "Addtownship");
      const location = textBetween(row, "SLocation");
      const shape = textBetween(row, "Shape");
      const id = textBetween(row, "CaseID") || `roadwork-${index}`;
      if (!id && !location && !shape) return null;
      return {
        id,
        type: textBetween(row, "TypeDetail") || "道路施工",
        name: textBetween(row, "ConstName") || textBetween(row, "TypeDetail") || "道路施工",
        location,
        township,
        start: textBetween(row, "Start") || null,
        stop: textBetween(row, "stop") || null,
        contractor: textBetween(row, "Factory") || null,
        points: parsePoints(shape),
      };
    })
    .filter((item): item is Roadwork => item !== null);
}

export async function fetchDaxiRoadworks(): Promise<Roadwork[]> {
  const response = await fetch(ROADWORKS_URL, {
    cache: "no-store",
    headers: { "User-Agent": "Daxi/0.1 resident roadworks map" },
  });
  if (!response.ok) {
    throw new Error(`Taoyuan roadworks request failed: ${response.status}`);
  }

  const raw = (await response.text()).trim();
  if (!raw || raw === "[]") return [];

  if (raw.startsWith("[") || raw.startsWith("{")) {
    const json = JSON.parse(raw) as Array<Record<string, unknown>>;
    return json
      .map((row, index): Roadwork => ({
        id: String(row.CaseID ?? `roadwork-${index}`),
        type: String(row.TypeDetail ?? "道路施工"),
        name: String(row.ConstName ?? row.TypeDetail ?? "道路施工"),
        location: String(row.SLocation ?? ""),
        township: String(row.Addtownship ?? ""),
        start: row.Start ? String(row.Start) : null,
        stop: row.stop ? String(row.stop) : null,
        contractor: row.Factory ? String(row.Factory) : null,
        points: parsePoints(String(row.Shape ?? "")),
      }))
      .filter((item) => item.township.includes("大溪") || item.location.includes("大溪"));
  }

  return parseXml(raw).filter((item) => item.township.includes("大溪") || item.location.includes("大溪"));
}
