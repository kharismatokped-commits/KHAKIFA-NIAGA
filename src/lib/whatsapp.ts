import { CartItem, CustomerOrderInfo } from "@/types/product";
import { formatRupiah, normalizeWhatsAppNumber } from "./formatters";
import { getOrderType, OrderType } from "./pricing";

export const DEFAULT_STORE_WHATSAPP = "6287789923079";
export const STORE_NAME = "Khalifa Niaga";

export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ""); // e.g. 260925
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `KN-${dateStr}-${randomSuffix}`;
}

export function buildWhatsAppMessage(
  orderNumber: string,
  customer: CustomerOrderInfo,
  items: CartItem[],
  totalAmount: number,
  orderType?: OrderType,
  storeName: string = STORE_NAME,
): string {
  const type = orderType || getOrderType(items);
  const lines: string[] = [];

  const titleHeader =
    type === "grosir" ? "*PESANAN GROSIR BARU*" : "*PESANAN BARU*";
  lines.push(titleHeader);
  lines.push(`Toko: *${storeName}*`);
  lines.push(`No. Order: *#${orderNumber}*`);
  lines.push(
    `Tipe: *${type === "grosir" ? "Pesanan Grosir" : "Pesanan Eceran"}*`,
  );
  lines.push(``);
  lines.push(`📦 *DATA PEMESAN:*`);
  if (type === "grosir" && customer.storeName && customer.storeName.trim()) {
    lines.push(`• Nama Toko   : ${customer.storeName.trim()}`);
  }
  lines.push(`• Nama Pemesan: ${customer.customerName}`);
  lines.push(`• No. WhatsApp: ${customer.whatsappNumber}`);
  lines.push(`• Alamat Kirim: ${customer.address}`);
  if (customer.notes && customer.notes.trim()) {
    lines.push(`• Catatan     : ${customer.notes.trim()}`);
  }
  lines.push(``);
  lines.push(`📋 *DETAIL BARANG:*`);

  items.forEach((item, index) => {
    const isRealVariant =
      item.variantName &&
      !["standar", "default", "pcs", "-pcs", "pak", "ktk"].includes(
        item.variantName.toLowerCase(),
      );
    const variantStr = isRealVariant ? ` (Varian: ${item.variantName})` : "";

    lines.push(`${index + 1}. *${item.productName}*${variantStr}`);
    lines.push(
      `   Jumlah : ${item.qty} pcs × ${formatRupiah(item.unitPrice)}`,
    );
    lines.push(`   Subtotal: *${formatRupiah(item.subtotal)}*`);
  });

  lines.push(``);
  lines.push(`═════════════════════════`);
  lines.push(`💰 *TOTAL TAGIHAN: ${formatRupiah(totalAmount)}*`);
  lines.push(`═════════════════════════`);
  lines.push(``);
  lines.push(
    `Halo admin ${storeName}, mohon dicek ketersediaan stok & perkiraan ongkir untuk pesanan di atas. Terima kasih! 🙏`,
  );

  return lines.join("\n");
}

export function createWhatsAppUrl(
  phone: string = DEFAULT_STORE_WHATSAPP,
  message: string,
): string {
  const normalizedPhone = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}
