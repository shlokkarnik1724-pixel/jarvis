import { Suspense } from "react";
import SimulatorClient from "./SimulatorClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-[var(--ink-muted)]">Loading simulator…</div>
      }
    >
      <SimulatorClient />
    </Suspense>
  );
}
