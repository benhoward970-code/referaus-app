// Admin email whitelist — add more emails here to grant admin access
export const ADMIN_EMAILS = ["benhoward970@gmail.com"];

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
