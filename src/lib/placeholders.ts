/**
 * Utility untuk menentukan gambar produk atau placeholder SVG lokal
 * berdasarkan kode atau ID kategori produk.
 */

export function getPlaceholderByCategory(
  categoryCodeOrId?: string | null,
): string {
  if (!categoryCodeOrId) return "/placeholders/lainnya.svg";

  const key = categoryCodeOrId.toLowerCase().trim();

  if (
    key === "atk" ||
    key.includes("tulis") ||
    key.includes("kantor") ||
    key.includes("buku")
  ) {
    return "/placeholders/atk.svg";
  }

  if (
    key === "rt" ||
    key.includes("rumah") ||
    key.includes("tangga") ||
    key.includes("kebersihan")
  ) {
    return "/placeholders/rumah-tangga.svg";
  }

  if (
    key === "plastik" ||
    key === "pk" ||
    key.includes("kemasan") ||
    key === "plastik-kemasan" ||
    key.includes("kresek")
  ) {
    return "/placeholders/plastik-kemasan.svg";
  }

  if (
    key === "kelontong" ||
    key.includes("sembako") ||
    key.includes("makanan") ||
    key.includes("minuman")
  ) {
    return "/placeholders/kelontong.svg";
  }

  if (
    key === "lt" ||
    key.includes("listrik") ||
    key.includes("perkakas") ||
    key.includes("elektronik")
  ) {
    return "/placeholders/listrik.svg";
  }

  return "/placeholders/lainnya.svg";
}

/**
 * Menghasilkan image URL untuk produk:
 * Jika produk memiliki foto asli (bukan legacy unsplash pen), pakai foto asli.
 * Jika belum ada foto asli, kembalikan placeholder SVG per kategori.
 */
export function getProductImage(
  gambar?: string[] | null,
  categoryCodeOrId?: string | null,
): { src: string; isPlaceholder: boolean } {
  if (
    gambar &&
    Array.isArray(gambar) &&
    gambar.length > 0 &&
    gambar[0] &&
    typeof gambar[0] === "string" &&
    gambar[0].trim() !== "" &&
    !gambar[0].includes("photo-1583485088034-697b5bc54ccd")
  ) {
    return { src: gambar[0], isPlaceholder: false };
  }

  return {
    src: getPlaceholderByCategory(categoryCodeOrId),
    isPlaceholder: true,
  };
}
