"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Library,
  FlaskConical,
  Settings,
  CreditCard,
  Cable,
  Sparkles,
  LogOut,
  Menu,
  X,
  Brain,
  Inbox,
  Radio,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const nav = [
  { href: "/brain", label: "Company Brain", icon: Brain },
  { href: "/ingestion", label: "Passive Ingestion", icon: Radio },
  { href: "/connectors", label: "Connectors", icon: Cable },
  { href: "/inbox", label: "Routing Inbox", icon: Inbox },
  { href: "/graph", label: "Knowledge Graph", icon: Network },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skill Library", icon: Library },
  { href: "/extract", label: "Extract Skill", icon: Sparkles },
  { href: "/simulator", label: "Sandbox Runtime", icon: FlaskConical },
  { href: "/settings", label: "Team & Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
    </>
  );
}

export function AppSidebar({
  orgName,
  userName,
}: {
  orgName: string;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-[var(--line)] bg-white/80 backdrop-blur">
        <div className="px-5 py-5 border-b border-[var(--line)]">
          <Link href="/brain" className="font-display text-xl tracking-tight">
            Tactix <span className="text-[var(--accent)]">AI</span>
          </Link>
          <p className="mt-2 text-xs text-[var(--ink-muted)] truncate">
            {orgName}
          </p>
          <p className="text-[10px] text-[var(--accent)] mt-1">Company brain</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
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

      <div className="md:hidden border-b border-[var(--line)] bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <span className="font-display text-lg">
            Tactix <span className="text-[var(--accent)]">AI</span>
          </span>
          <p className="text-[10px] text-[var(--ink-muted)] truncate max-w-[180px]">
            {orgName}
          </p>
        </div>
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-[var(--line)] p-2"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1 mt-2">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>
            <div className="mt-6 border-t border-[var(--line)] pt-4">
              <p className="text-sm font-medium">{userName}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 px-0"
                onClick={logout}
              >
                <LogOut size={14} /> Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
