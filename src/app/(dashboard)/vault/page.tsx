import { CanvasViewer } from "@/components/vault/canvas-viewer";
import { VaultUpload } from "@/components/vault/vault-upload";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { DEMO_MODE } from "@/lib/config";
import { listPhotos } from "@/lib/data/circle-queries";
import { getDemoPhotos } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function VaultPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const photos =
    DEMO_MODE || session.demo
      ? getDemoPhotos()
      : await listPhotos(requireCircleId(session));
  const viewerName = session.membership?.nickname || session.user.name;

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-3xl">Photo Vault</h1>
          <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
            Media streams through an authenticated proxy and renders only on a hardened
            canvas. Right-click, drag, and console export paths are blocked.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <VaultUpload enabled={!session.demo && !DEMO_MODE} />
      </Reveal>

      {photos.length === 0 ? (
        <p className="text-[var(--ink-muted)]">No vault photos yet.</p>
      ) : (
        <Stagger className="space-y-10">
          {photos.map((photo) => (
            <StaggerItem key={photo.id}>
              <figure className="space-y-3">
                <CanvasViewer
                  photoId={photo.id}
                  viewerName={viewerName}
                  viewerIp="session"
                  className="w-full max-w-3xl border border-[var(--line)] shadow-[0_20px_44px_-30px_rgba(20,32,27,0.45)]"
                />
                <figcaption className="text-sm text-[var(--ink-muted)]">
                  Uploaded by {photo.uploaderName}
                  {photo.captionHint ? ` · ${photo.captionHint}` : ""}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
