import PageHeader from "@/components/PageHeader";
import GarbageTruckMap from "@/components/GarbageTruckMap";

const DAXI_OFFICE_URL = "https://www.daxi.tycg.gov.tw";

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <h2 className="text-[14px] font-bold mb-3" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContactRow({ label, phone }: { label: string; phone: string }) {
  return (
    <a
      href={`tel:${phone}`}
      className="flex items-center justify-between py-2.5 border-b last:border-b-0 transition-opacity active:opacity-70"
      style={{ borderColor: "var(--line)" }}
    >
      <span className="text-[13px]" style={{ color: "var(--ink)" }}>
        {label}
      </span>
      <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--river-teal)" }}>
        {phone}
      </span>
    </a>
  );
}

export default function ResidentServicesPage() {
  return (
    <div className="pt-2">
      <PageHeader title="里民服務" subtitle="生活大小事，這裡先找" tint="river" />

      <div className="safe-page-x pb-10 fade-in flex flex-col gap-4">
        <SectionCard id="report" title="陳情 / 報修">
          <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
            路燈故障、道路坑洞、路樹倒伏等問題，可撥打市民專線或前往區公所網站陳情信箱通報。
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="tel:1999"
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-opacity active:opacity-70"
              style={{ background: "var(--river-teal-soft)" }}
            >
              <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
                撥打市民專線 1999
              </span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--river-teal)" }}>
                撥打
              </span>
            </a>
            <a
              href={DAXI_OFFICE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-opacity active:opacity-70"
              style={{ border: "1px solid var(--line)" }}
            >
              <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
                前往區公所線上陳情
              </span>
              <span aria-hidden="true" style={{ color: "var(--ink-soft)" }}>
                ↗
              </span>
            </a>
          </div>
        </SectionCard>

        <SectionCard id="emergency" title="緊急聯絡">
          <div>
            <ContactRow label="警察報案" phone="110" />
            <ContactRow label="消防／救護" phone="119" />
            <ContactRow label="婦幼保護專線" phone="113" />
            <ContactRow label="反詐騙諮詢專線" phone="165" />
            <ContactRow label="桃園市民專線" phone="1999" />
          </div>
        </SectionCard>

        <SectionCard id="garbage" title="垃圾清運">
          <GarbageTruckMap />
        </SectionCard>

        <SectionCard id="links" title="常用連結">
          <div className="flex flex-col gap-2">
            {[
              { label: "戶政服務", note: "戶籍謄本、身分證異動" },
              { label: "地政服務", note: "地籍謄本、地價查詢" },
              { label: "稅務服務", note: "地價稅、房屋稅" },
              { label: "區公所首頁", note: "各項服務入口" },
            ].map((l) => (
              <a
                key={l.label}
                href={DAXI_OFFICE_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-opacity active:opacity-70"
                style={{ border: "1px solid var(--line)" }}
              >
                <span>
                  <span className="block text-[13px] font-medium" style={{ color: "var(--ink)" }}>
                    {l.label}
                  </span>
                  <span className="block text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    {l.note}
                  </span>
                </span>
                <span aria-hidden="true" style={{ color: "var(--ink-soft)" }}>
                  ↗
                </span>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
