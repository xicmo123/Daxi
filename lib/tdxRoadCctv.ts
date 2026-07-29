import { tdxFetch } from "./tdx";

const CITY = "Taoyuan";

const DAXI_BOUNDS = {
  minLat: 24.8,
  maxLat: 24.905,
  minLon: 121.24,
  maxLon: 121.37,
};

const DAXI_ROAD_KEYWORDS = [
  "台3",
  "台4",
  "台7",
  "介壽",
  "員林",
  "康莊",
  "慈湖",
  "信義",
  "中華",
  "復興",
  "瑞安",
  "大鶯",
  "永昌",
  "石園",
  "石門",
];

const DIRECTION_LABEL: Record<string, string> = {
  E: "往東",
  W: "往西",
  S: "往南",
  N: "往北",
  NE: "往東北",
  NW: "往西北",
  SE: "往東南",
  SW: "往西南",
};

export type RoadCctvCamera = {
  id: string;
  title: string;
  roadName: string;
  directionLabel: string;
  areaGroup: string;
  location: string;
  latitude: number;
  longitude: number;
  streamUrl: string;
  imageUrl?: string;
  refreshRate?: number;
};

export type RoadCctvFeed = {
  cameras: RoadCctvCamera[];
  updateTime?: string;
  sourceUpdateTime?: string;
  sourceName: string;
};

type TdxRoadSection = {
  Start?: string;
  End?: string;
};

type TdxCctv = {
  CCTVID?: string;
  RoadName?: string;
  RoadDirection?: string;
  RoadSection?: TdxRoadSection;
  SurveillanceDescription?: string;
  PositionLat?: number;
  PositionLon?: number;
  VideoStreamURL?: string;
  VideoImageURL?: string;
  ImageRefreshRate?: number;
};

type TdxCctvResponse = {
  CCTVs?: TdxCctv[];
  UpdateTime?: string;
  SrcUpdateTime?: string;
};

function isInsideDaxiBounds(camera: TdxCctv) {
  const lat = camera.PositionLat;
  const lon = camera.PositionLon;
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat >= DAXI_BOUNDS.minLat &&
    lat <= DAXI_BOUNDS.maxLat &&
    lon >= DAXI_BOUNDS.minLon &&
    lon <= DAXI_BOUNDS.maxLon
  );
}

function hasDaxiRoadName(camera: TdxCctv) {
  const text = [camera.RoadName, camera.SurveillanceDescription, camera.RoadSection?.Start, camera.RoadSection?.End]
    .filter(Boolean)
    .join(" ");
  return DAXI_ROAD_KEYWORDS.some((keyword) => text.includes(keyword));
}

function groupFor(roadName: string) {
  if (/台7|復興|慈湖/.test(roadName)) return "慈湖 / 北橫";
  if (/台4|大鶯|瑞安|石門/.test(roadName)) return "河岸 / 台4";
  if (/介壽|員林|康莊|信義|中華|永昌|石園/.test(roadName)) return "市區周邊";
  if (/台3/.test(roadName)) return "台3線";
  return "其他";
}

function describeLocation(camera: TdxCctv) {
  const sectionStart = camera.RoadSection?.Start?.trim();
  const sectionEnd = camera.RoadSection?.End?.trim();
  if (sectionStart && sectionEnd) return `${sectionStart} - ${sectionEnd}`;
  if (sectionStart) return sectionStart;
  if (sectionEnd) return sectionEnd;
  return camera.SurveillanceDescription?.trim() || "大溪區道路 CCTV";
}

function roadPriority(camera: RoadCctvCamera) {
  if (/慈湖|復興|台7/.test(camera.roadName)) return 0;
  if (/康莊|信義|中華|介壽/.test(camera.roadName)) return 1;
  if (/台3|台4|瑞安|大鶯/.test(camera.roadName)) return 2;
  return 3;
}

export async function fetchDaxiRoadCctvs(): Promise<RoadCctvFeed> {
  const data = await tdxFetch<TdxCctvResponse>(`/v2/Road/Traffic/CCTV/City/${CITY}`);
  const cameras = (data.CCTVs ?? [])
    .filter((camera) => isInsideDaxiBounds(camera) && hasDaxiRoadName(camera) && camera.CCTVID && camera.VideoStreamURL)
    .map((camera): RoadCctvCamera => {
      const roadName = camera.RoadName?.trim() || "大溪道路";
      const directionLabel = DIRECTION_LABEL[camera.RoadDirection ?? ""] ?? camera.RoadDirection ?? "";
      return {
        id: camera.CCTVID!,
        title: directionLabel ? `${roadName} ${directionLabel}` : roadName,
        roadName,
        directionLabel,
        areaGroup: groupFor(roadName),
        location: describeLocation(camera),
        latitude: camera.PositionLat!,
        longitude: camera.PositionLon!,
        streamUrl: camera.VideoStreamURL!,
        imageUrl: camera.VideoImageURL,
        refreshRate: camera.ImageRefreshRate,
      };
    })
    .sort((a, b) => roadPriority(a) - roadPriority(b) || a.roadName.localeCompare(b.roadName, "zh-Hant"))
    .slice(0, 32);

  return {
    cameras,
    updateTime: data.UpdateTime,
    sourceUpdateTime: data.SrcUpdateTime,
    sourceName: "交通部 TDX 路況資訊 v2 / 桃園市道路 CCTV",
  };
}
