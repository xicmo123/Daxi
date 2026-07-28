import MerchantRedeemResult from "@/components/merchant/MerchantRedeemResult";

export const dynamic = "force-dynamic";

export default async function MerchantRedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ couponId?: string; token?: string }>;
}) {
  const params = await searchParams;
  const couponId = typeof params.couponId === "string" ? params.couponId : "";
  const token = typeof params.token === "string" ? params.token : "";

  if (!couponId || !token) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
        <h1 className="font-serif text-xl font-bold mb-2">無法核銷</h1>
        <p className="text-[13px] leading-relaxed" style={{ color: "#766a5d" }}>
          QR Code 缺少必要資訊，請顧客重新開啟優惠券。
        </p>
        <a
          href="/merchant"
          className="mt-5 inline-flex rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ background: "#9c3b3b", color: "#fff" }}
        >
          回商家後台
        </a>
      </div>
    );
  }

  return <MerchantRedeemResult couponId={couponId} token={token} />;
}
