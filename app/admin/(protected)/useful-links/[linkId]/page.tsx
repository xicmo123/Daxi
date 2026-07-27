import { notFound } from "next/navigation";
import { getUsefulLink } from "@/lib/usefulLinks";
import UsefulLinkForm from "@/components/admin/UsefulLinkForm";

export const dynamic = "force-dynamic";

export default async function EditUsefulLinkPage({ params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const link = await getUsefulLink(linkId);
  if (!link) notFound();
  return <UsefulLinkForm link={link} />;
}
