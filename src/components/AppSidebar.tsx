"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Library,
  FlaskConical,
  Settings,
  Cable,
  Sparkles,
  LogOut,
  Menu,
  X,
  Brain,
  Inbox,
  Network,
  Map,
  Compass,
  Command,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const nav = [
  { href: "/command", label: "Command Center", icon: Command },
  { href: "/brain", label: "Ask Brain", icon: Brain },
  { href: "/connectors", label: "Sources", icon: Cable },
  { href: "/inbox", label: "Ops Inbox", icon: Inbox },
  { href: "/map", label: "Operating Map", icon: Map },
  { href: "/skills", label: "Skill Library", icon: Library },
  { href: "/extract", label: "Extract Skill", icon: Sparkles },
  { href: "/simulator", label: "Sandbox", icon: FlaskConical },
  { href: "/graph", label: "Knowledge Graph", icon: Network },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tour", label: "Thesis Tour", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings },
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
                ? "bg-[var(--accent-soft)] text-[var(--hud-cyan)] font-medium border border-[var(--line)]"
                : "text-[var(--ink-muted)] hover:bg-white/[0.04] hover:text-[var(--ink)]"
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
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-[var(--line)] bg-[#071018]/90 backdrop-blur">
        <div className="px-5 py-5 border-b border-[var(--line)]">
          <Link href="/command" className="font-display text-lg tracking-[0.12em]">
            TACTIX <span className="text-[var(--hud-cyan)]">AI</span>
          </Link>
          <p className="mt-2 text-xs text-[var(--ink-muted)] truncate">{orgName}</p>
          <p className="text-[10px] text-[var(--hud-amber)] mt-1 flex items-center gap-1 tracking-[0.2em] uppercase">
            <Rocket size={10} /> Company brain online
          </p>
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

      <div className="md:hidden border-b border-[var(--line)] bg-[#071018] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <span className="font-display text-sm tracking-[0.12em]">
            TACTIX <span className="text-[var(--hud-cyan)]">AI</span>
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
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-[#071018] p-4 shadow-xl overflow-y-auto border-l border-[var(--line)]"
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
