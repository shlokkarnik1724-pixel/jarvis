"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/store/toast-store";

export function VaultUpload({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!enabled) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Sign in with a real account to upload vault photos.
      </p>
    );
  }

  function upload() {
    if (!file) return;
    startTransition(async () => {
      setError(null);
      const form = new FormData();
      form.set("file", file);
      form.set("caption", caption);
      const response = await fetch("/api/vault/upload", {
        method: "POST",
        body: form,
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!json.success) {
        const err = json.error ?? "Upload failed";
        setError(err);
        toast("Upload failed", { description: err, tone: "error" });
        return;
      }
      setFile(null);
      setCaption("");
      toast("Photo secured", {
        description: "Streaming through the vault canvas.",
        tone: "success",
      });
      router.refresh();
    });
  }

  return (
    <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5">
      <h2 className="text-lg font-medium">Upload to vault</h2>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Optional caption"
      />
      <Button disabled={pending || !file} onClick={upload}>
        {pending ? "Uploading…" : "Upload securely"}
      </Button>
      {pending ? (
        <div className="space-y-2 pt-1" role="status" aria-label="Uploading">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </section>
  );
}
