import { redirect } from "next/navigation";

/**
 * One-click demo entry. Server redirect — no client "booting" spinner that can
 * hang when JS/HMR fails behind public tunnels.
 */
export default function DemoLaunchPage() {
  redirect("/api/demo/launch");
}
