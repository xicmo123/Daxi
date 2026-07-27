import { readUsefulLinks } from "@/lib/usefulLinks";
import UsefulLinkList from "@/components/admin/UsefulLinkList";

export const dynamic = "force-dynamic";

export default async function UsefulLinksDashboard() {
  const links = await readUsefulLinks();
  return <UsefulLinkList links={links} />;
}
