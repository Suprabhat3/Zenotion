export const PEERLIST_PROJECT_URL =
  "https://peerlist.io/suprabhat/project/zenotion--ai-notes";

/** Public project ID from the Peerlist Launch Dashboard embed snippet. */
export const PEERLIST_EMBED_PROJECT_ID = "PRJHDNDOAJAABQJEEHMEOQ7LOGGAQ9";

export type PeerlistEmbedTheme = "light" | "dark";

export type PeerlistEmbedOptions = {
  showUpvote?: boolean;
  theme?: PeerlistEmbedTheme;
};

export function getPeerlistEmbedImageUrl(
  options: PeerlistEmbedOptions = {},
): string {
  const { showUpvote = true, theme = "light" } = options;
  const params = new URLSearchParams({
    showUpvote: String(showUpvote),
    theme,
  });

  return `https://peerlist.io/api/v1/projects/embed/${PEERLIST_EMBED_PROJECT_ID}?${params.toString()}`;
}
