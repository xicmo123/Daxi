// Merchant account CRUD (data/merchant-accounts.json) — split out from
// lib/merchantAuth.ts (which only verifies logins) so the admin backend can
// create/rotate/remove a merchant's passcode without ever touching the
// filesystem directly.
import { dataPath, readJsonFile, updateJsonFile } from "./jsonStore";

const ACCOUNTS_PATH = dataPath("merchant-accounts.json");

export type MerchantAccount = {
  passcode: string;
  businessName: string;
  disabled?: boolean;
  /** Set by the admin when issuing a reset; forces a change at next login. */
  mustChangePasscode?: boolean;
  /** ISO timestamp of the last successful passcode change. */
  passcodeUpdatedAt?: string;
};
export type MerchantAccountRecord = MerchantAccount & { placeId: string };

type Accounts = Record<string, MerchantAccount>;

export async function readMerchantAccounts(): Promise<Accounts> {
  const data = await readJsonFile<unknown>(ACCOUNTS_PATH, {});
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Accounts) : {};
}

// All mutations run inside updateJsonFile: the account map is read, changed
// and written as one locked step, so an admin creating an account can't wipe
// out a passcode rotation that landed a millisecond earlier.
async function mutate<R>(change: (accounts: Accounts) => { next: Accounts; result: R }): Promise<R> {
  let result!: R;
  await updateJsonFile<Accounts>(ACCOUNTS_PATH, {}, (current) => {
    const accounts = current && typeof current === "object" && !Array.isArray(current) ? current : {};
    const changed = change({ ...accounts });
    result = changed.result;
    return changed.next;
  });
  return result;
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
  const conflict = await mutate<boolean>((accounts) => {
    if (accounts[record.placeId]) return { next: accounts, result: true };
    accounts[record.placeId] = {
      passcode: record.passcode,
      businessName: record.businessName,
      passcodeUpdatedAt: new Date().toISOString(),
    };
    return { next: accounts, result: false };
  });
  if (conflict) throw new Error("這個地點已經有商家帳號了");
}

export async function updateMerchantAccount(
  placeId: string,
  input: { businessName: string; passcode?: string; disabled?: boolean; mustChangePasscode?: boolean },
): Promise<boolean> {
  return mutate<boolean>((accounts) => {
    const existing = accounts[placeId];
    if (!existing) return { next: accounts, result: false };
    const passcodeChanged = input.passcode !== undefined && input.passcode !== existing.passcode;
    accounts[placeId] = {
      businessName: input.businessName,
      passcode: input.passcode ?? existing.passcode,
      disabled: input.disabled ?? existing.disabled,
      mustChangePasscode: input.mustChangePasscode ?? existing.mustChangePasscode,
      passcodeUpdatedAt: passcodeChanged ? new Date().toISOString() : existing.passcodeUpdatedAt,
    };
    return { next: accounts, result: true };
  });
}

export async function setMerchantAccountDisabled(placeId: string, disabled: boolean): Promise<MerchantAccountRecord | null> {
  return mutate<MerchantAccountRecord | null>((accounts) => {
    const existing = accounts[placeId];
    if (!existing) return { next: accounts, result: null };
    accounts[placeId] = { ...existing, disabled };
    return { next: accounts, result: { placeId, ...accounts[placeId] } };
  });
}

export async function deleteMerchantAccount(placeId: string): Promise<boolean> {
  return mutate<boolean>((accounts) => {
    if (!(placeId in accounts)) return { next: accounts, result: false };
    delete accounts[placeId];
    return { next: accounts, result: true };
  });
}
