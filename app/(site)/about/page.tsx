import { permanentRedirect } from "next/navigation";

// 關於 is a popup now (components/AboutModalHost.tsx); old links and search
// results land on the home page with it open.
export default function AboutPage() {
  permanentRedirect("/#about");
}
