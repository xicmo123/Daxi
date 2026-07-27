import { listMerchantAccounts } from "@/lib/merchantAccounts";
import MerchantAccountList from "@/components/admin/MerchantAccountList";

export const dynamic = "force-dynamic";

export default async function MerchantsDashboard() {
  const accounts = await listMerchantAccounts();
  return <MerchantAccountList accounts={accounts} />;
}
