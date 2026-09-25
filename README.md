# Integrasi Higgsfield AI (`gery project`)

Koneksi ke **[Higgsfield AI](https://higgsfield.ai)** via **API Console** (`api.higgsfield.ai`).

## Kredensial yang Digunakan
Kredensial Anda telah disimpan secara aman di file [`.env`](file:///Users/kharismabahtiar/Projects/gery%20project%20/.env):
- **Key ID:** `b1371f13-bddb-41d3-852c-2169b4d0bde9`
- **Key Secret:** `aac36d0082de64bfb176b0fd220d1c7a18bd82887bfd18fbe595ff55af1971f8`

File `.env` telah ditambahkan ke [`.gitignore`](file:///Users/kharismabahtiar/Projects/gery%20project%20/.gitignore) agar aman dan tidak bocor ke git repository.

---

## Struktur File
- [`.env`](file:///Users/kharismabahtiar/Projects/gery%20project%20/.env) - Menyimpan kunci API Higgsfield.
- [`.gitignore`](file:///Users/kharismabahtiar/Projects/gery%20project%20/.gitignore) - Mengabaikan `.env` dan file cache.
- [`higgsfield_api.py`](file:///Users/kharismabahtiar/Projects/gery%20project%20/higgsfield_api.py) - Client Python untuk autentikasi, tes koneksi, submit request, dan polling status.
- [`example_generate.py`](file:///Users/kharismabahtiar/Projects/gery%20project%20/example_generate.py) - Skrip contoh untuk membuat generasi gambar/video dengan prompt kustom.

---

## Cara Penggunaan

### 1. Uji Koneksi API (Tanpa Biaya Kredit)
```bash
python3 higgsfield_api.py test
```
*Hasil yang diharapkan:*
```
[*] Menguji koneksi Higgsfield API dengan Key ID: b1371f13...bde9
[+] KONEKSI BERHASIL: API Key terverifikasi aktif dan diterima oleh Higgsfield AI!
```

### 2. Menjalankan Generasi Media
```bash
python3 example_generate.py "A cinematic portrait of a cyberpunk explorer in neon city, 8k"
```

### 3. Menggunakan di Kode Python Sendiri
```python
from higgsfield_api import HiggsfieldClient

client = HiggsfieldClient()

# Kirim request pembuatan
res = client.create_generation(
    model="higgsfield-ai/soul/v2/standard",
    prompt="Pemandangan pegunungan saat matahari terbenam"
)

# Tunggu sampai selesai (polling)
output = client.wait_for_completion(res["status_url"])
print(output)
```

---

## Catatan Penting
- API Higgsfield menggunakan sistem saldo/kredit terpisah dari langganan web biasa (pay-as-you-go di [console.higgsfield.ai](https://console.higgsfield.ai)).
- Format header otentikasi standar:
  `Authorization: Key <HF_KEY_ID>:<HF_KEY_SECRET>`
