"use client";

import type { AEDStation } from "@/lib/aedService";
import { useNearestAED, type NearestAEDResult } from "@/lib/useNearestAED";

function navUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

function StationCard({
  name,
  placement,
  address,
  lat,
  lng,
  emergencyPhone,
  meta,
}: {
  name: string;
  placement: string;
  address: string;
  lat: number;
  lng: number;
  emergencyPhone: string | null;
  meta?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-white bg-white/10 px-4 py-4">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-[19px] font-black leading-tight text-white">{name}</h3>
        {meta ? <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[13px] font-black text-red-700">{meta}</span> : null}
      </div>
      {placement ? <p className="text-[14px] font-semibold text-white/90 mb-0.5">📍 {placement}</p> : null}
      <p className="text-[13px] text-white/80 mb-3">{address}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={navUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[16px] font-black text-red-700 transition-opacity active:opacity-80"
        >
          🧭 一鍵導航
        </a>
        {emergencyPhone ? (
          <a
            href={`tel:${emergencyPhone.split(/[#\s]/)[0]}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-white px-4 py-3 text-[16px] font-black text-white transition-opacity active:opacity-80"
          >
            📞 撥打
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function EmergencyPanel({ stations }: { stations: AEDStation[] }) {
  const { status, results, findNearest } = useNearestAED(stations);

  return (
    <div className="rounded-3xl bg-red-700 px-5 py-6" style={{ background: "#b3261e" }}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[26px]" aria-hidden="true">
          🚨
        </span>
        <h2 className="text-[22px] font-black text-white">AED 緊急尋找</h2>
      </div>
      <p className="mb-5 text-[14px] font-semibold leading-relaxed text-white/85">
        心跳停止的黃金搶救時間只有幾分鐘，找到最近的 AED 立即前往。
      </p>

      <button
        type="button"
        onClick={findNearest}
        disabled={status === "locating"}
        className="mb-4 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-[20px] font-black text-red-700 transition-opacity active:opacity-80 disabled:opacity-70"
        style={{ color: "#b3261e" }}
      >
        {status === "locating" ? "定位中…" : "📍 尋找附近 AED"}
      </button>

      {status === "denied" ? (
        <div className="mb-4 rounded-xl bg-white/15 px-4 py-3 text-[14px] font-semibold text-white">
          你拒絕了定位權限，以下顯示大溪區全部 AED 站點，請自行找出最近的一台。
        </div>
      ) : status === "error" ? (
        <div className="mb-4 rounded-xl bg-white/15 px-4 py-3 text-[14px] font-semibold text-white">
          定位失敗，以下顯示大溪區全部 AED 站點，請自行找出最近的一台。
        </div>
      ) : null}

      {status === "success" && results.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="text-[13px] font-bold uppercase tracking-wide text-white/70">最近的 3 台 AED</div>
          {results.map(({ station, distanceMeters, walkMinutes }: NearestAEDResult, i) => (
            <StationCard
              key={station.id}
              name={`${i + 1}. ${station.name}`}
              placement={station.placement}
              address={station.address}
              lat={station.lat}
              lng={station.lng}
              emergencyPhone={station.emergencyPhone}
              meta={`約 ${distanceMeters < 1000 ? `${Math.round(distanceMeters)}m` : `${(distanceMeters / 1000).toFixed(1)}km`} · 步行約 ${walkMinutes} 分`}
            />
          ))}
        </div>
      ) : (status === "denied" || status === "error") && stations.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="text-[13px] font-bold uppercase tracking-wide text-white/70">大溪區全部 AED（{stations.length} 台）</div>
          {stations.map((station) => (
            <StationCard
              key={station.id}
              name={station.name}
              placement={station.placement}
              address={station.address}
              lat={station.lat}
              lng={station.lng}
              emergencyPhone={station.emergencyPhone}
            />
          ))}
        </div>
      ) : status === "idle" && stations.length === 0 ? (
        <div className="rounded-xl bg-white/15 px-4 py-3 text-[14px] font-semibold text-white">AED 資料暫時無法載入，請改用大溪區公所或 119 協助查詢。</div>
      ) : null}
    </div>
  );
}
