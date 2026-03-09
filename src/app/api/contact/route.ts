import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, type } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to Supabase if configured
    const db = supabaseAdmin || supabaseServer;
    if (db) {
      const { error: dbError } = await db.from("enquiries").insert({
        participant_name: name,
        participant_email: email,
        message: phone ? `[${type || "general"}] Phone: ${phone}\n\n${message}` : `[${type || "general"}] ${message}`,
        status: "open",
      });
      if (dbError) {
        console.error("Supabase insert error:", dbError);
      }
    }

    // Also try Formspree as notification mechanism
    try {
      await fetch("https://formspree.io/f/benhoward970@gmail.com", {
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
    } catch {
      // Formspree failure is non-fatal; log the enquiry
      console.log("ENQUIRY:", { name, email, phone, type, message, timestamp: new Date().toISOString() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
