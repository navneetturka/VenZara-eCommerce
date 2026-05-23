const PLACEHOLDER =
  "https://placehold.co/400x500/e5e7eb/6b7280?text=No+Image";

/** Resolve product or category image to a displayable URL. */
export function getProductImageUrl(image, index = 0) {
  if (!image) return PLACEHOLDER;

  if (Array.isArray(image)) {
    const url = image[index] ?? image[0];
    if (typeof url === "string" && url.trim() && url !== "YOUR_IMAGE_URL") {
      return url;
    }
    return PLACEHOLDER;
  }

  if (typeof image === "string" && image.trim() && image !== "YOUR_IMAGE_URL") {
    return image;
  }

  return PLACEHOLDER;
}
