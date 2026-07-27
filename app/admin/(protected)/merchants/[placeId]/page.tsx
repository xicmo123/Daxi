import { notFound } from "next/navigation";
import { getMerchantAccount } from "@/lib/merchantAccounts";
import MerchantAccountForm from "@/components/admin/MerchantAccountForm";

export const dynamic = "force-dynamic";

export default async function EditMerchantPage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const account = await getMerchantAccount(decodeURIComponent(placeId));
  if (!account) notFound();
  return <MerchantAccountForm account={account} />;
}
