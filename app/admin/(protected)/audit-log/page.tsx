import { readAuditLog, type AuditAction } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<AuditAction, string> = {
  "admin.login.success": "管理員登入成功",
  "admin.login.failure": "管理員登入失敗",
  "admin.sessions.revoke": "強制登出所有管理員",
  "merchant.sessions.revoke": "強制登出所有商家",
  "push.broadcast": "發送推播通知",
  "merchant.create": "開通商家帳號",
  "merchant.update": "編輯商家帳號",
  "merchant.disable": "停用商家帳號",
  "merchant.enable": "啟用商家帳號",
  "merchant.delete": "刪除商家帳號",
};

export default async function AuditLogPage() {
  const entries = await readAuditLog();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2f261f" }}>
        操作紀錄
      </h1>
      <p className="text-[12px] mb-5" style={{ color: "#766a5d" }}>
        記錄管理員登入與商家帳號的異動，最多保留近 2000 筆。僅存於此伺服器本機，重新部署會歸零。
      </p>

      <div className="flex flex-col gap-1.5">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <span className="shrink-0 tabular-nums" style={{ color: "#766a5d", minWidth: 150 }}>
              {new Date(entry.at).toLocaleString("zh-TW")}
            </span>
            <span className="shrink-0 font-medium" style={{ color: "#2f261f", minWidth: 120 }}>
              {ACTION_LABELS[entry.action] ?? entry.action}
            </span>
            {entry.target ? (
              <span className="truncate" style={{ color: "#766a5d" }}>
                {entry.target}
                {entry.detail ? `（${entry.detail}）` : ""}
              </span>
            ) : null}
            {entry.ip ? (
              <span className="ml-auto shrink-0" style={{ color: "#a89a86" }}>
                {entry.ip}
              </span>
            ) : null}
          </div>
        ))}
        {entries.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚無紀錄
          </p>
        ) : null}
      </div>
    </div>
  );
}
