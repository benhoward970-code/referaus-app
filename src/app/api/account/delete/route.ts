import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const admin = getAdmin();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/**
 * DELETE /api/account/delete
 * Permanently deletes all personal data for the authenticated user.
 * Australian Privacy Act 1988 - Australian Privacy Principle 13 (right to erasure).
 *
 * What we delete:
 * - provider profile (and their reviews, enquiries by cascade or explicit delete)
 * - newsletter subscription
 * - the Supabase auth user account itself
 *
 * What we KEEP (legal obligation):
 * - Stripe billing records (financial records must be kept 7 years under Australian tax law)
 * - Anonymized enquiries (we null out personal info but keep the record for provider stats)
 */
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdmin();

  try {
    // 1. Get the provider slug for cascade deletes
    const { data: provider } = await admin
      .from("providers")
      .select("id, slug, email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (provider) {
      // 2. Anonymize enquiries (keep record for provider stats, null personal data)
      await admin
        .from("enquiries")
        .update({ name: "[deleted]", email: null, phone: null, message: "[deleted]" })
        .eq("provider_slug", provider.slug);

      // 3. Delete reviews written by this provider's email
      //    Reviews submitted by users don't have a user_id, only email
      if (provider.email) {
        await admin.from("reviews").delete().eq("reviewer_email", provider.email);
      }

      // 4. Delete the provider profile
      await admin.from("providers").delete().eq("id", provider.id);
    }

    // 5. Remove newsletter subscription
    await admin.from("newsletter").delete().eq("email", user.email!);

    // 6. Delete the auth user (this is irreversible)
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error("[account/delete] Failed to delete auth user:", deleteUserError.message);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Your account and personal data have been permanently deleted.",
    });
  } catch (err) {
    console.error("[account/delete] Error:", err);
    return NextResponse.json({ error: "Deletion failed — please contact support" }, { status: 500 });
  }
}
