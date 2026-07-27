// Merchant account CRUD (data/merchant-accounts.json) — split out from
// lib/merchantAuth.ts (which only verifies logins) so the admin backend can
// create/rotate/remove a merchant's passcode without ever touching the
// filesystem directly. Same "UI prototype, not production-grade identity"
// caveat as merchantAuth.ts applies here too.
import { promises as fs } from "fs";
import path from "path";

const ACCOUNTS_PATH = path.join(process.cwd(), "data", "merchant-accounts.json");

export type MerchantAccount = { passcode: string; businessName: string };
export type MerchantAccountRecord = MerchantAccount & { placeId: string };

export async function readMerchantAccounts(): Promise<Record<string, MerchantAccount>> {
  try {
    const raw = await fs.readFile(ACCOUNTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeMerchantAccounts(accounts: Record<string, MerchantAccount>) {
  await fs.mkdir(path.dirname(ACCOUNTS_PATH), { recursive: true });
  await fs.writeFile(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + "\n", "utf-8");
}

export async function listMerchantAccounts(): Promise<MerchantAccountRecord[]> {
  const accounts = await readMerchantAccounts();
  return Object.entries(accounts)
    .map(([placeId, account]) => ({ placeId, ...account }))
    .sort((a, b) => a.businessName.localeCompare(b.businessName));
}

export async function getMerchantAccount(placeId: string): Promise<MerchantAccountRecord | null> {
  const accounts = await readMerchantAccounts();
  const account = accounts[placeId];
  return account ? { placeId, ...account } : null;
}

export async function createMerchantAccount(record: MerchantAccountRecord): Promise<void> {
  const accounts = await readMerchantAccounts();
  if (accounts[record.placeId]) throw new Error("這個地點已經有商家帳號了");
  accounts[record.placeId] = { passcode: record.passcode, businessName: record.businessName };
  await writeMerchantAccounts(accounts);
}

export async function updateMerchantAccount(placeId: string, input: MerchantAccount): Promise<boolean> {
  const accounts = await readMerchantAccounts();
  if (!accounts[placeId]) return false;
  accounts[placeId] = input;
  await writeMerchantAccounts(accounts);
  return true;
}

export async function deleteMerchantAccount(placeId: string): Promise<boolean> {
  const accounts = await readMerchantAccounts();
  if (!(placeId in accounts)) return false;
  delete accounts[placeId];
  await writeMerchantAccounts(accounts);
  return true;
}
