import { NextResponse } from "next/server";
import { getYieldOpportunities } from "@/lib/opportunities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const opportunities = await getYieldOpportunities();

    return NextResponse.json({
      opportunities,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch yield opportunities.",
      },
      { status: 500 },
    );
  }
}
