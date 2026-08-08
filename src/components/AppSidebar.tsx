"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  FlaskConical,
  Settings,
  CreditCard,
  Cable,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skill Library", icon: Library },
  { href: "/extract", label: "Extract Skill", icon: Sparkles },
  { href: "/simulator", label: "Simulator", icon: FlaskConical },
  { href: "/sources", label: "Data Sources", icon: Cable },
  { href: "/settings", label: "Team & Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function AppSidebar({
  orgName,
  userName,
}: {
  orgName: string;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--line)] bg-white/80 backdrop-blur">
      <div className="px-5 py-5 border-b border-[var(--line)]">
        <Link href="/dashboard" className="font-display text-xl tracking-tight">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </Link>
        <p className="mt-2 text-xs text-[var(--ink-muted)] truncate">{orgName}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent-deep)] font-medium"
                  : "text-[var(--ink-muted)] hover:bg-black/[0.03] hover:text-[var(--ink)]"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--line)] p-4">
        <p className="text-sm font-medium truncate">{userName}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start px-0 text-[var(--ink-muted)]"
          onClick={logout}
        >
          <LogOut size={14} /> Sign out
        </Button>
      </div>
    </aside>
  );
}
