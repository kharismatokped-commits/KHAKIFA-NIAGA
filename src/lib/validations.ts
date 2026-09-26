import { z } from "zod";

export const CartItemCalculationInputSchema = z.object({
  productVariantId: z.string().min(1, "productVariantId wajib diisi"),
  jenisKemasan: z.enum(["pcs", "pak"], {
    message: "jenisKemasan harus 'pcs' atau 'pak'",
  }),
  qty: z.number().int().positive("Kuantitas (qty) harus lebih dari 0"),
});

export const CartCalculationRequestSchema = z.object({
  items: z
    .array(CartItemCalculationInputSchema)
    .min(1, "Keranjang belanja tidak boleh kosong"),
});

export const CreateOrderRequestSchema = z.object({
  namaToko: z.string().trim().optional(),
  namaPemesan: z.string().trim().min(1, "Nama pemesan wajib diisi"),
  noWhatsApp: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .regex(/^[0-9+]+$/, "Nomor WhatsApp hanya boleh berupa angka"),
  alamat: z.string().trim().min(1, "Alamat lengkap pengiriman wajib diisi"),
  catatan: z.string().trim().optional(),
  items: z
    .array(CartItemCalculationInputSchema)
    .min(1, "Pesanan harus memiliki minimal 1 barang"),
});

export const ProductsQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  page: z.coerce.number().int().positive().default(1),
});

export type CartItemCalculationInput = z.infer<
  typeof CartItemCalculationInputSchema
>;
export type CartCalculationRequest = z.infer<
  typeof CartCalculationRequestSchema
>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
