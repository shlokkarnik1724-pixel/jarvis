import { CanvasViewer } from "@/components/vault/canvas-viewer";
import { DEMO_MODE } from "@/lib/config";
import { getDemoPhotos } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";

export default async function VaultPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const photos = DEMO_MODE || session.demo ? getDemoPhotos() : [];
  const viewerName = session.membership?.nickname || session.user.name;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Photo Vault</h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
          Media streams through an authenticated proxy and renders only on a hardened
          canvas. Right-click, drag, and console export paths are blocked.
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="text-[var(--ink-muted)]">No vault photos yet.</p>
      ) : (
        <div className="space-y-10">
          {photos.map((photo) => (
            <figure key={photo.id} className="space-y-3">
              <CanvasViewer
                photoId={photo.id}
                viewerName={viewerName}
                viewerIp="session"
                className="w-full max-w-3xl border border-[var(--line)]"
              />
              <figcaption className="text-sm text-[var(--ink-muted)]">
                Uploaded by {photo.uploaderName}
                {photo.captionHint ? ` · ${photo.captionHint}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
