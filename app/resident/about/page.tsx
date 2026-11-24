import { permanentRedirect } from "next/navigation";

// 關於 is a popup now (components/AboutModalHost.tsx); old links and search
// results land on 我是大溪人 with it open.
export default function ResidentAboutPage() {
  permanentRedirect("/resident#about");
}
