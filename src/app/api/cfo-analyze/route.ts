
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Read env vars inside function to ensure runtime availability
    const INTELLIGENCE_ENGINE_URL = process.env.INTELLIGENCE_ENGINE_URL;
    const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

    // 1. Validate Environment Variables
    if (!INTELLIGENCE_ENGINE_URL || !INTERNAL_API_SECRET) {
      console.error("[CFO Route] Missing environment variables");
      return NextResponse.json(
        { error: "Configuration Error" },
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
    // Using 127.0.0.1 explicit to avoid Nodejs IPv6 issues
    const safeUrl = INTELLIGENCE_ENGINE_URL.replace('localhost', '127.0.0.1');

    console.log(`[CFO Route] Proxying to ${safeUrl}...`);
    
    const response = await fetch(`${safeUrl}/ai/cfo/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ workspace_id }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CFO Route] FastAPI Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: "Upstream Service Error", details: errorText },
        { status: 502 } // Bad Gateway
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
