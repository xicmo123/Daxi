import type { Status } from "./data";

const SOURCE_URL =
  "https://opendata.tycg.gov.tw/api/dataset/f4cc0b12-86ac-40f9-8745-885bddc18f79/resource/0381e141-f7ee-450e-99da-2240208d1773/download";

type RawLot = {
  parkName: string;
  address: string;
  areaName: string;
  totalSpace: string;
  surplusSpace: string;
};

export type LiveParkingLot = {
  name: string;
  address: string;
  total: number;
  surplus: number | null;
  isOpenAccess: boolean;
  status: Status;
  statusLabel: string;
  pct: number | null;
};

function toLot(raw: RawLot): LiveParkingLot {
  const total = Number(raw.totalSpace);
  const surplusNum = Number(raw.surplusSpace);
  const isOpenAccess = Number.isNaN(surplusNum);
  const pct = !isOpenAccess && total > 0 ? Math.round((surplusNum / total) * 100) : null;

  let status: Status = "ok";
  let statusLabel = "充裕";
  if (isOpenAccess) {
    statusLabel = "開放中";
  } else if (pct === 0) {
    status = "full";
    statusLabel = "已滿";
  } else if (pct !== null && pct < 15) {
    status = "mid";
    statusLabel = "略滿";
  }

  return {
    name: raw.parkName,
    address: raw.address,
    total,
    surplus: isOpenAccess ? null : surplusNum,
    isOpenAccess,
    status,
    statusLabel,
    pct,
  };
}

// Taoyuan open-data platform (opendata.tycg.gov.tw) — no API key required,
// dataset refreshes roughly every minute. Filtered to 大溪區 (Daxi district).
export async function fetchDaxiParking(): Promise<LiveParkingLot[]> {
  const res = await fetch(SOURCE_URL, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Taoyuan parking API responded ${res.status}`);
  }
  const data: RawLot[] = await res.json();
  return data.filter((d) => d.areaName === "大溪區").map(toLot);
}
