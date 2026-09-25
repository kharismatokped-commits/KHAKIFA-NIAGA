/**
 * Format angka ke format mata uang Rupiah (IDR)
 * Contoh: 25000 -> "Rp 25.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\s+/g, " ");
}

/**
 * Format angka dengan separator ribuan
 * Contoh: 1250 -> "1.250"
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Normalisasi nomor WhatsApp ke standar internasional tanpa simbol
 * Contoh: "0812-3456-7890" -> "6281234567890"
 */
export function normalizeWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("+62")) {
    cleaned = "62" + cleaned.slice(3);
  }
  return cleaned;
}
