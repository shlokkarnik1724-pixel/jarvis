import { SignupPageClient } from "@/components/AuthForms";
import { isSupabaseConfigured } from "@/lib/config";

export default function SignupPage() {
  return <SignupPageClient supabaseEnabled={isSupabaseConfigured()} />;
}
