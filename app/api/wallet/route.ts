import { NextRequest, NextResponse } from "next/server";
import { getWalletSnapshot } from "@/lib/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "A wallet address is required." },
      { status: 400 },
    );
  }

  try {
    const snapshot = await getWalletSnapshot(address);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch the wallet snapshot.",
      },
      { status: 500 },
    );
  }
}
