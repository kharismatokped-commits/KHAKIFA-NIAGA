/**
 * Kamus Sinonim & Singkatan Produk Grosir
 * Untuk mengakomodasi istilah pencarian umum pembeli awam/retailer
 */
export const SYNONYMS: Record<string, string[]> = {
  // Alat Tulis & Perlengkapan Kantor
  lem: ["perekat", "glue", "glukol", "dlukol", "castol", "fox", "uhue", "alteco"],
  perekat: ["lem", "glue", "solasi", "lakban"],
  glue: ["lem", "perekat"],
  pulpen: ["pena", "bolpoin", "ballpoint", "ballpen", "pen", "faster", "standard"],
  pulpn: ["pulpen", "pena", "bolpoin", "ballpoint"],
  pena: ["pulpen", "bolpoin", "ballpoint", "pen"],
  bolpoin: ["pulpen", "pena", "ballpoint"],
  ballpoint: ["pulpen", "pena", "bolpoin", "pen"],
  pen: ["pulpen", "pena", "bolpoin", "ballpoint"],
  pensil: ["pencil", "2b", "faber", "joyko"],
  penghapus: ["eraser", "hapusan", "tipex", "tipe x", "correction"],
  tipex: ["tipe x", "correction tape", "penghapus"],
  kertas: ["hvs", "paper", "folio", "f4", "a4", "bmo", "sidu", "sinar dunia"],
  hvs: ["kertas", "f4", "a4", "bmo", "sidu"],
  buku: ["tulis", "notes", "notebook", "sidu", "quarto", "ekspedisi"],
  bindex: ["ordner", "map", "file", "binder"],
  map: ["folder", "stopmap", "bindex", "snelhecter"],
  gunting: ["pemotong", "scissor", "cutter"],
  cutter: ["pisau", "cutter", "kenko"],
  stapler: ["hecter", "stepler", "hekter", "staples", "isi staples"],
  stepler: ["stapler", "hecter", "hekter", "staples"],
  hecter: ["stapler", "stepler", "hekter", "staples"],
  hekter: ["stapler", "stepler", "hecter", "staples"],
  staples: ["stapler", "isi staples", "stepler", "hecter"],
  lakban: ["solasi", "isolasi", "tape", "opp", "daimaru", "nachitape"],
  solasi: ["lakban", "isolasi", "tape"],
  isolasi: ["lakban", "solasi", "tape"],
  tape: ["lakban", "solasi", "isolasi"],
  spidol: ["marker", "snowman", "boardmarker", "permanent"],
  atk: ["alat tulis", "kantor", "stationery"],
  "alat tulis": ["atk", "stationery", "pulpen", "pensil", "kertas"],

  // Plastik & Kemasan
  plastik: ["kresek", "kantong", "hdpe", "pe", "pp", "kemasan", "plastik sampah"],
  kresek: ["plastik", "kantong", "asoy"],
  kantong: ["kresek", "plastik", "bag"],
  dus: ["box", "karton", "kardus", "kotak"],
  kardus: ["dus", "box", "karton"],
  box: ["dus", "kardus", "kotak"],
  bubble: ["bubble wrap", "gelembung"],
  mika: ["kotak makanan", "kemasan", "thinwall"],
  cup: ["gelas", "cup kopi", "cup plastik"],
  gelas: ["cup", "cangkir"],
  sendok: ["garpu", "sendok bebek", "sendok plastik"],

  // Rumah Tangga & Kelontong
  tisu: ["tissue", "paseo", "nice", "montis", "jolly"],
  tissue: ["tisu", "paseo", "nice", "montis", "jolly"],
  sabun: ["deterjen", "rinso", "daia", "sabun cuci", "mama lemon", "sunlight"],
  deterjen: ["sabun", "rinso", "daia", "boom", "so klin"],
  minyak: ["goreng", "bimoli", "filma", "sunco", "sancho", "fortune"],
  beras: ["sembako", "rojo lele", "pandan wangi"],
  gula: ["pasir", "gulaku", "rose brand"],
  kopi: ["kapal api", "luwak", "nescafe", "good day"],
  teh: ["sariwangi", "poci", "sosro", "tong tji"],
  susu: ["indomilk", "frisian flag", "bendera", "dancow"],
  baterai: ["batre", "battery", "abc", "panasonic"],
  batre: ["baterai", "battery", "abc"],
  lampu: ["bohlam", "led", "philips"],
  kabel: ["colokan", "steker", "terminal", "stop kontak", "cok"],
  cok: ["steker", "colokan", "stop kontak"],

  // Satuan & Kemasan
  pak: ["pack", "kemasan", "box"],
  pack: ["pak", "kemasan"],
  pcs: ["satuan", "buah", "biji"],
  lusin: ["lsn", "12"],
  roll: ["rol", "gulung"],
  rim: ["500 lembar", "kertas"],
};

/**
 * Normalisasi input pencarian:
 * - Mengabaikan perbedaan besar-kecil huruf (toLowerCase)
 * - Menghapus whitespace di awal/akhir (trim)
 * - Menyatukan spasi berlebih menjadi satu spasi (replace(/\s+/g, ' '))
 */
export function normalizeSearchQuery(query: string): string {
  if (!query) return "";
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Mengembangkan query dengan sinonim dan variasi kata
 */
export function expandSearchTerms(query: string): {
  normalized: string;
  terms: string[];
} {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return { normalized: "", terms: [] };
  }

  const words = normalized.split(" ").filter(Boolean);
  const termsSet = new Set<string>([normalized, ...words]);

  // Cek sinonim untuk input lengkap
  if (SYNONYMS[normalized]) {
    for (const syn of SYNONYMS[normalized]) {
      termsSet.add(syn);
    }
  }

  // Cek sinonim per token kata
  for (const w of words) {
    if (SYNONYMS[w]) {
      for (const syn of SYNONYMS[w]) {
        termsSet.add(syn);
      }
    }
  }

  return {
    normalized,
    terms: Array.from(termsSet),
  };
}
