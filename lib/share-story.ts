"use client";

/**
 * Shares the 9:16 story card image via the native share sheet (Instagram
 * offers itself as a target and drops the image straight into the story
 * composer). Falls back to downloading the card plus an instagram://
 * story-camera deep-link. Returns how it ended so callers can reflect it.
 */
export async function shareStoryCard(title: string): Promise<"shared" | "aborted" | "fallback"> {
  const host = window.location.hostname;
  const cardPath = host.startsWith("petition.oasishwc")
    ? "/story-card-oasis.png"
    : host.startsWith("savethecat-public")
      ? "/story-card-public.png"
      : "/story-card.png";
  const blob = await (await fetch(cardPath)).blob();
  const file = new File([blob], "save-the-cat-story.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "aborted";
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "save-the-cat-story.png";
  a.click();
  setTimeout(() => {
    const frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.src = "instagram://story-camera";
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 2000);
  }, 800);
  return "fallback";
}
