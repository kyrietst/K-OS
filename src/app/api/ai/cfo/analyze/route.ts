
import { NextResponse } from "next/server";

const INTELLIGENCE_ENGINE_URL = process.env.INTELLIGENCE_ENGINE_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(request: Request) {
  try {
    // 1. Validate Environment Variables
    console.log("[CFO Route] Env check:", {
      hasUrl: !!INTELLIGENCE_ENGINE_URL,
      hasSecret: !!INTERNAL_API_SECRET,
      url: INTELLIGENCE_ENGINE_URL?.substring(0, 10) + "..."
    });

    if (!INTELLIGENCE_ENGINE_URL || !INTERNAL_API_SECRET) {
      console.error("[CFO Route] Missing environment variables");
      return NextResponse.json(
        { 
          error: "Configuration Error", 
          details: {
            hasUrl: !!INTELLIGENCE_ENGINE_URL, 
            hasSecret: !!INTERNAL_API_SECRET
          }
        },
        { status: 500 }
      );
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { workspace_id } = body;

    if (!workspace_id) {
      return NextResponse.json(
        { error: "Missing workspace_id" },
        { status: 400 }
      );
    }

    // 3. Proxy Request to Intelligence Engine (FastAPI)
    // We add the X-Internal-Secret header here, securely on the server
    const response = await fetch(`${INTELLIGENCE_ENGINE_URL}/ai/cfo/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ workspace_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CFO Route] FastAPI Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: "Upstream Service Pending" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("[CFO Route] Fatal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
