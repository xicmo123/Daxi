"use client";

// App Review rejected 1.0(2) under guideline 4: tapping 導航 left iOS users in
// a third-party map with no way to use the one built into their phone. Silently
// rewriting every Google Maps link to `maps://` would satisfy the letter of it,
// but Apple's wording is "give users the *option*" — and half of 大溪 navigates
// with Google Maps by habit. So the tap opens this sheet instead.
import Modal from "./ui/Modal";

export type MapsChoices = {
  /** `maps://` — the built-in Apple Maps app. */
  apple: string;
  /** The original https Google Maps URL the link carried. */
  google: string;
};

export default function MapsAppSheet({
  choices,
  onPick,
  onClose,
}: {
  choices: MapsChoices;
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} label="選擇導航地圖" align="bottom" className="p-4">
      <p className="px-1 pb-3 pt-1 text-center text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>
        使用哪個地圖導航？
      </p>

      <div className="flex flex-col gap-2">
        <Choice label="Apple 地圖" icon="🗺️" onClick={() => onPick(choices.apple)} />
        <Choice label="Google 地圖" icon="📍" onClick={() => onPick(choices.google)} />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 min-h-12 w-full rounded-2xl text-[16px] font-bold transition-opacity active:opacity-70"
        style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
      >
        取消
      </button>
    </Modal>
  );
}

function Choice({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-[17px] font-bold transition-opacity active:opacity-70"
      style={{ background: "var(--paper-2)", color: "var(--ink)" }}
    >
      <span aria-hidden className="text-[20px]">
        {icon}
      </span>
      {label}
    </button>
  );
}
