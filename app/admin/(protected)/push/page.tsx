import PushBroadcastForm from "@/components/admin/PushBroadcastForm";

export const dynamic = "force-dynamic";

export default function PushPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2f261f" }}>
        推播通知
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "#766a5d" }}>
        發送給已開啟通知的居民裝置。只有訂閱該類別的裝置會收到，送出後無法收回，請先確認內容。
      </p>
      <PushBroadcastForm />
    </div>
  );
}
