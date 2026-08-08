"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Select } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type SkillRow = {
  id: string;
  title: string;
  category: string;
  confidence: number;
  status: string;
  sourceRef: string;
  updatedAt: string;
};

function SkillsLibraryInner() {
  const search = useSearchParams();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [status, setStatus] = useState(search.get("status") || "all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fromUrl = search.get("status");
    if (fromUrl) setStatus(fromUrl);
  }, [search]);

  useEffect(() => {
    const qs = new URLSearchParams({ status, category });
    fetch(`/api/skills?${qs}`)
      .then((r) => r.json())
      .then((d) => setSkills(d.skills || []))
      .catch(() => undefined);
  }, [status, category]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            Skill Library
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Review, approve, version, and export every extracted rule.
          </p>
        </div>
        <Link href="/extract">
          <Button>+ Extract New Skill</Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          className="w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Select
          className="w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          <option>Refunds</option>
          <option>Escalation</option>
          <option>Discounting</option>
          <option>Incident Response</option>
          <option>Other</option>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-[var(--line)] bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--bg)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr
                key={s.id}
                className="border-t border-[var(--line)] hover:bg-[var(--bg)]/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/skills/${s.id}`}
                    className="font-medium text-[var(--accent-deep)] hover:underline"
                  >
                    {s.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{s.category}</td>
                <td className="px-4 py-3">
                  {Math.round(s.confidence * 100)}%
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      s.status === "approved"
                        ? "ok"
                        : s.status === "rejected"
                          ? "danger"
                          : "warn"
                    }
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {s.sourceRef}
                </td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {formatDate(s.updatedAt)}
                </td>
              </tr>
            ))}
            {!skills.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[var(--ink-muted)]"
                >
                  No skills yet. Extract one from a pasted conversation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SkillsLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-[var(--ink-muted)]">Loading library…</div>
      }
    >
      <SkillsLibraryInner />
    </Suspense>
  );
}
