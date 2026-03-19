import { NextResponse } from "next/server";
import { getCafeData } from "@/lib/data/menu";

export async function GET() {
  const data = await getCafeData();
  return NextResponse.json(data, { status: 200 });
}
