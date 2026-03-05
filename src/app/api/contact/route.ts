import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, type } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send via Formspree (free, no API key needed)
    const formspreeRes = await fetch("https://formspree.io/f/benhoward970@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || "Not provided",
        type,
        message,
        _subject: `[Refer] New ${type} enquiry from ${name}`,
      }),
    });

    if (!formspreeRes.ok) {
      // Fallback: log it so we don't lose the enquiry
      console.log("ENQUIRY:", { name, email, phone, type, message, timestamp: new Date().toISOString() });
      // Still return success - we logged it
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}