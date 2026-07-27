import { NextRequest, NextResponse } from "next/server";
import { createClinic, parseClinicInput, readClinics } from "@/lib/clinicData";

export async function GET() {
  const clinics = await readClinics();
  return NextResponse.json({ clinics });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const parsed = parseClinicInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const clinic = await createClinic(parsed.input);
  return NextResponse.json({ ok: true, clinic });
}
