"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        setError(json.error ?? "Upload failed");
        return;
      }
      setFile(null);
      setCaption("");
      router.refresh();
    });
  }

  return (
    <section className="space-y-3 border-y border-[var(--line)] py-6">
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
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </section>
  );
}
