import { NextRequest, NextResponse } from "next/server";
import { deleteClinic, parseClinicInput, updateClinic } from "@/lib/clinicData";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const parsed = parseClinicInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const clinic = await updateClinic(clinicId, parsed.input);
  if (!clinic) return NextResponse.json({ error: "找不到這間診所" }, { status: 404 });
  return NextResponse.json({ ok: true, clinic });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;
  const ok = await deleteClinic(clinicId);
  if (!ok) return NextResponse.json({ error: "找不到這間診所" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
