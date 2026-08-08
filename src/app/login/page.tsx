import { LoginPageClient } from "@/components/AuthForms";
import { isSupabaseConfigured } from "@/lib/config";

export default function LoginPage() {
  return <LoginPageClient supabaseEnabled={isSupabaseConfigured()} />;
}
