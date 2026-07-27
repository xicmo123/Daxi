"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MerchantAccountRecord } from "@/lib/merchantAccounts";

export default function MerchantAccountList({ accounts }: { accounts: MerchantAccountRecord[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (placeId: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」的商家帳號嗎？該商家將無法再登入後台。`)) return;
    setBusyId(placeId);
    try {
      await fetch(`/api/admin/merchants/${encodeURIComponent(placeId)}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
            商家帳號
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            開通後商家可用通關密語登入 /merchant 自行維護營業時間與優惠券
          </p>
        </div>
        <Link
          href="/admin/merchants/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#a06a3a", color: "#fff" }}
        >
          + 開通新商家
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {accounts.map((account) => (
          <div key={account.placeId} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <Link href={`/admin/merchants/${encodeURIComponent(account.placeId)}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {account.businessName}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                通關密語：{account.passcode}
              </div>
            </Link>
            <button
              onClick={() => remove(account.placeId, account.businessName)}
              disabled={busyId === account.placeId}
              aria-label="刪除"
              className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
              style={{ color: "#b0503f" }}
            >
              刪除
            </button>
          </div>
        ))}
        {accounts.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未開通任何商家帳號
          </p>
        ) : null}
      </div>
    </div>
  );
}
