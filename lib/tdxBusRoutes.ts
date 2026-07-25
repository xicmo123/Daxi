// Route/stop search + ETA lookup for the bus feature, layered on top of the
// TDX "StopOfRoute" and "EstimatedTimeOfArrival" datasets. Lets a rider
// search by route number OR by a stop/destination name (OData `contains`
// over both fields in one query) since tourists usually know a landmark
// name, not the route number.
import { tdxFetch } from "./tdx";

const CITY = "Taoyuan";

export type BusStop = { name: string; sequence: number };

export type BusRouteMatch = {
  routeUID: string;
  routeName: string;
  departure: string;
  destination: string;
  direction: number;
  stops: BusStop[];
};

type TdxStopOfRoute = {
  RouteUID: string;
  RouteName?: { Zh_tw?: string };
  DepartureStopNameZh?: string;
  DestinationStopNameZh?: string;
  Direction: number;
  Stops?: { StopName?: { Zh_tw?: string }; StopSequence: number }[];
};

function escapeOData(value: string) {
  return value.replace(/'/g, "''");
}

export async function searchBusRoutes(query: string): Promise<BusRouteMatch[]> {
  const q = escapeOData(query.trim());
  if (!q) return [];

  const filter = `contains(RouteName/Zh_tw,'${q}') or Stops/any(s: contains(s/StopName/Zh_tw,'${q}'))`;
  const raw = await tdxFetch<TdxStopOfRoute[]>(
    `/v2/Bus/StopOfRoute/City/${CITY}?%24filter=${encodeURIComponent(filter)}&%24top=15`
  );

  return raw.map((r) => ({
    routeUID: r.RouteUID,
    routeName: r.RouteName?.Zh_tw ?? "—",
    departure: r.DepartureStopNameZh ?? "",
    destination: r.DestinationStopNameZh ?? "",
    direction: r.Direction,
    stops: (r.Stops ?? [])
      .map((s) => ({ name: s.StopName?.Zh_tw ?? "", sequence: s.StopSequence }))
      .sort((a, b) => a.sequence - b.sequence),
  }));
}

export type BusEtaStop = {
  stopName: string;
  sequence: number;
  estimateMinutes: number | null;
  state: string;
};

type TdxEta = {
  StopName?: { Zh_tw?: string };
  StopSequence: number;
  Direction?: number;
  EstimateTime?: number;
  StopStatus?: number;
};

function describeStopStatus(status: number | undefined, estimateMinutes: number | null) {
  switch (status) {
    case 1:
      return "尚未發車";
    case 2:
      return "交管不停靠";
    case 3:
      return "末班車已過";
    case 4:
      return "今日未營運";
    default:
      return estimateMinutes === null ? "無資料" : estimateMinutes <= 0 ? "進站中" : `約 ${estimateMinutes} 分`;
  }
}

// TDX's ETA-by-route-name endpoint returns both directions interleaved (and
// sometimes multiple sub-routes sharing the same display name), so a
// direction filter is required to avoid mixing two different stop
// sequences into one list.
export async function fetchRouteEta(routeName: string, direction?: number): Promise<BusEtaStop[]> {
  const raw = await tdxFetch<TdxEta[]>(
    `/v2/Bus/EstimatedTimeOfArrival/City/${CITY}/${encodeURIComponent(routeName)}`
  );

  return raw
    .filter((e) => direction === undefined || e.Direction === direction)
    .map((e) => {
      const estimateMinutes = typeof e.EstimateTime === "number" ? Math.round(e.EstimateTime / 60) : null;
      return {
        stopName: e.StopName?.Zh_tw ?? "",
        sequence: e.StopSequence,
        estimateMinutes,
        state: describeStopStatus(e.StopStatus, estimateMinutes),
      };
    })
    .sort((a, b) => a.sequence - b.sequence);
}
