/**
 * Single source of truth for blog post slugs.
 *
 * The list page and the detail page previously had their own copy of this
 * function, and they disagreed about hyphens: the list page stripped them while
 * the detail page kept them. Any title containing a hyphen ("Pi-hole") therefore
 * produced a link that the detail page could not resolve, which surfaced as
 * "Article Not Found".
 *
 * Both pages import this so the two can never drift apart again.
 */

/** Characters that are safe to keep once a title becomes a URL segment. */
const DIACRITICS = /[\u0300-\u036f]/g;
const UNSAFE = /[^\p{L}\p{N}\s-]/gu;

export function createSlug(title: string): string {
  if (!title || typeof title !== "string") return "post";

  return title
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(UNSAFE, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slugs are compared after this normalisation so that links created by an older
 * build (or by hand) still resolve instead of 404-ing.
 *
 * `"the-homelab-saga-taming-pihole"` and `"the-homelab-saga-taming-pi-hole"`
 * both collapse to the same key.
 */
export function slugKey(slug: string): string {
  return createSlug(String(slug || "").replace(/-/g, " ")).replace(/-/g, "");
}

export function slugsMatch(a: string, b: string): boolean {
  return slugKey(a) === slugKey(b);
}

/** Pick the post whose slug matches `targetSlug`, tolerating legacy links. */
export function findBySlug<T extends { slug?: string; title?: string }>(
  posts: T[],
  targetSlug: string,
): T | undefined {
  const exact = posts.find((p) => p.slug === targetSlug);
  if (exact) return exact;

  const loose = posts.find(
    (p) =>
      (p.slug && slugsMatch(p.slug, targetSlug)) ||
      (p.title && slugsMatch(createSlug(p.title), targetSlug)),
  );
  return loose;
}
