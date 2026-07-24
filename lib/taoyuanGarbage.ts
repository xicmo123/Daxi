const OFFICIAL_BASE = "https://route.tyoem.gov.tw";
const DATA_AGENT_URL = `${OFFICIAL_BASE}/web/dataManagerAgentWeb.jsp`;
const DAXI_GID = "lagi2-007";

type OfficialResult<T> = {
  errCode: string;
  msg?: string;
  result?: T;
};

export type GarbageRoute = {
  id: string;
  name: string;
  displayName: string;
  areaLabel: string;
  primaryCar: string | null;
  recycleCar: string | null;
  runType: string | null;
};

export type GarbageVehicle = {
  id: string;
  type: "垃圾車" | "資源回收車" | string;
  lat: number;
  lng: number;
  speed: number | null;
  direction: string | null;
  status: string | null;
  cleanStatus: string | null;
  address: string | null;
  gpsTime: number | null;
};

export type GarbageStop = {
  id: number;
  seq: number;
  name: string;
  lat: number;
  lng: number;
  arriveTime: string | null;
  estimateTime: string | null;
  passed: boolean;
};

export type GarbageRealtime = {
  routeId: string;
  vehicles: GarbageVehicle[];
  stops: GarbageStop[];
  path: Array<[number, number]>;
  latestGpsTime: number | null;
  updatedAt: string;
};

type OfficialRoute = {
  car1?: string;
  car2?: string;
  routing_id: string;
  routing_name: string;
  run_type?: string;
};

type OfficialVehicle = {
  addr?: string;
  car_id: string;
  car_type: string;
  clean_status?: string;
  direction?: string;
  gpstime?: { time?: number };
  lat: number;
  lng: number;
  speed?: number;
  status?: string;
};

type OfficialStop = {
  arrive_time?: string;
  est_time?: string;
  lat: number;
  lng: number;
  passd?: string;
  poi_id: number;
  poi_name: string;
  seq: number;
};

type OfficialTrace = {
  routing_path?: string;
};

const DAXI_ROUTE_LABELS: Record<string, { displayName: string; areaLabel: string }> = {
  西一區: { displayName: "慈光／新興／介壽一帶", areaLabel: "仁善、僑愛周邊" },
  西二區: { displayName: "介壽／僑愛／長興一帶", areaLabel: "僑愛、仁善周邊" },
  西三區: { displayName: "隆德／仁和／埔頂一帶", areaLabel: "仁和、埔頂周邊" },
  西五區: { displayName: "員林／仁二／大鶯一帶", areaLabel: "仁和、員林周邊" },
  西六區: { displayName: "永昌／南興／仁和一帶", areaLabel: "南興、仁和周邊" },
  西七區: { displayName: "三元／員林二三段一帶", areaLabel: "三元、員林周邊" },
  東一區: { displayName: "月眉／中華／中央一帶", areaLabel: "月眉、老街周邊" },
  東二區: { displayName: "慈湖／民權東／和一東二一帶", areaLabel: "田心、老街周邊" },
  東三區: { displayName: "瑞安／康莊／文化一帶", areaLabel: "瑞興、美華周邊" },
  "東五區(一四五)": { displayName: "復興／頭寮平日一四五", areaLabel: "福安、復興周邊" },
  "東五區(二六)": { displayName: "復興／頭寮平日二六", areaLabel: "福安、復興周邊" },
  中午班1: { displayName: "南興／僑愛／美華中午班", areaLabel: "南興、僑愛、美華周邊" },
  中午班2: { displayName: "百吉／內柵／崁津中午班", areaLabel: "百吉、內柵周邊" },
  社區專線: { displayName: "社區專線", areaLabel: "社區集合點" },
};

function routeLabel(routeName: string) {
  return DAXI_ROUTE_LABELS[routeName] ?? {
    displayName: routeName.replaceAll("區", "線"),
    areaLabel: "大溪清運路線",
  };
}

async function createOfficialSession() {
  const response = await fetch(OFFICIAL_BASE, {
    cache: "no-store",
    headers: {
      "User-Agent": "Daxi/0.1 resident garbage map",
    },
  });
  const html = await response.text();
  const token = html.match(/id="random_form" type="hidden" name="random_form" value="([^"]+)"/)?.[1];
  const cookie = response.headers.get("set-cookie")?.split(";")[0];

  if (!response.ok || !token || !cookie) {
    throw new Error("Unable to start Taoyuan garbage data session.");
  }

  return { token, cookie };
}

async function officialPost<T>(dcfid: string, params: Record<string, string>): Promise<T> {
  const session = await createOfficialSession();
  const body = new URLSearchParams({
    dcfid,
    random_form: session.token,
    ...params,
  });
  const response = await fetch(DATA_AGENT_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Cookie: session.cookie,
      Referer: `${OFFICIAL_BASE}/`,
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Daxi/0.1 resident garbage map",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Taoyuan garbage data request failed: ${response.status}`);
  }

  const data = (await response.json()) as OfficialResult<T>;
  if (data.errCode !== "0000") {
    throw new Error(data.msg ?? "Taoyuan garbage data request failed.");
  }

  return data.result ?? ([] as T);
}

function parseTracePath(value: string | undefined): Array<[number, number]> {
  if (!value) return [];
  return value
    .split("|")
    .map((pair): [number, number] | null => {
      const [lng, lat] = pair.split(",").map(Number);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    })
    .filter((point): point is [number, number] => point !== null);
}

export async function fetchDaxiGarbageRoutes(): Promise<GarbageRoute[]> {
  const routes = await officialPost<OfficialRoute[]>("lagifQueryRouteByTown", { gid: DAXI_GID });
  return routes.map((route) => ({
    id: route.routing_id,
    name: route.routing_name,
    ...routeLabel(route.routing_name),
    primaryCar: route.car1 ?? null,
    recycleCar: route.car2 ?? null,
    runType: route.run_type ?? null,
  }));
}

export async function fetchDaxiGarbageRealtime(routeId: string): Promise<GarbageRealtime> {
  const [vehicles, stops, trace] = await Promise.all([
    officialPost<OfficialVehicle[]>("lagifQueryRealtimeByRoute", { routing_id: routeId }),
    officialPost<OfficialStop[]>("lagifRealtimeRouteDetailByRoute", { routing_id: routeId }),
    officialPost<OfficialTrace[]>("lagifQueryTraceByRoute", { routing_id: routeId }),
  ]);
  const mappedVehicles = vehicles
    .filter((vehicle) => Number.isFinite(vehicle.lat) && Number.isFinite(vehicle.lng))
    .map((vehicle) => ({
      id: vehicle.car_id,
      type: vehicle.car_type,
      lat: vehicle.lat,
      lng: vehicle.lng,
      speed: typeof vehicle.speed === "number" ? vehicle.speed : null,
      direction: vehicle.direction ?? null,
      status: vehicle.status ?? null,
      cleanStatus: vehicle.clean_status ?? null,
      address: vehicle.addr?.trim() || null,
      gpsTime: vehicle.gpstime?.time ?? null,
    }));
  const latestGpsTime =
    mappedVehicles.reduce((latest, vehicle) => (vehicle.gpsTime && vehicle.gpsTime > latest ? vehicle.gpsTime : latest), 0) ||
    null;

  return {
    routeId,
    vehicles: mappedVehicles,
    stops: stops
      .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
      .map((stop) => ({
        id: stop.poi_id,
        seq: stop.seq,
        name: stop.poi_name,
        lat: stop.lat,
        lng: stop.lng,
        arriveTime: stop.arrive_time ?? null,
        estimateTime: stop.est_time ?? null,
        passed: stop.passd === "1",
      })),
    path: parseTracePath(trace[0]?.routing_path),
    latestGpsTime,
    updatedAt: new Date().toISOString(),
  };
}
