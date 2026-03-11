import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const results: string[] = [];

  // Create providers table
  const { error: e1 } = await supabaseAdmin.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS providers (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        name text NOT NULL,
        slug text UNIQUE NOT NULL,
        abn text,
        bio text,
        description text,
        category text DEFAULT 'Daily Living',
        location text,
        suburb text,
        postcode text,
        state text DEFAULT 'NSW',
        phone text,
        email text,
        website text,
        services text[] DEFAULT '{}',
        brand_color text DEFAULT '#f97316',
        logo_url text,
        cover_image_url text,
        gallery_urls text[] DEFAULT '{}',
        rating numeric(2,1) DEFAULT 0,
        review_count integer DEFAULT 0,
        verified boolean DEFAULT false,
        registration_ready boolean DEFAULT false,
        plan text DEFAULT 'free' CHECK (plan IN ('free','starter','pro','premium')),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `,
  });

  // If rpc doesn't exist, we'll handle it via direct table creation approach
  if (e1) {
    results.push("RPC not available, using direct approach...");

    // Try creating tables using the REST API approach - check if table exists
    const { error: checkErr } = await supabaseAdmin.from("providers").select("id").limit(1);

    if (checkErr?.code === "42P01") {
      // Table doesn't exist - we need to create it via SQL
      results.push("providers table does not exist - SQL must be run manually");
    } else if (!checkErr) {
      results.push("providers table already exists");
    } else {
      results.push(`providers check: ${checkErr.message}`);
    }
  } else {
    results.push("providers table created");
  }

  // Create reviews table (check if exists)
  const { error: revCheck } = await supabaseAdmin.from("reviews").select("id").limit(1);
  if (revCheck?.code === "42P01") {
    results.push("reviews table needs manual creation");
  } else {
    results.push("reviews table exists");
  }

  // Create enquiries table (check if exists)
  const { error: enqCheck } = await supabaseAdmin.from("enquiries").select("id").limit(1);
  if (enqCheck?.code === "42P01") {
    results.push("enquiries table needs manual creation");
  } else {
    results.push("enquiries table exists");
  }

  // Create storage bucket
  const { error: bucketErr } = await supabaseAdmin.storage.createBucket("provider-images", {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  });
  if (bucketErr) {
    if (bucketErr.message?.includes("already exists")) {
      results.push("provider-images bucket already exists");
    } else {
      results.push(`Bucket error: ${bucketErr.message}`);
    }
  } else {
    results.push("provider-images bucket created");
  }

  return NextResponse.json({ results });
}
