#!/usr/bin/env python3
"""
Contoh pembuatan gambar / video menggunakan Higgsfield AI API.
Perhatian: Menjalankan skrip ini akan mengirimkan permintaan nyata dan menggunakan saldo/kredit Higgsfield Anda.
"""

import sys
from higgsfield_api import HiggsfieldClient

def main():
    client = HiggsfieldClient()

    prompt = "A cinematic portrait of a cyberpunk explorer in neon city, highly detailed, photorealistic, 8k"
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])

    print(f"[*] Mengirim permintaan generasi ke Higgsfield AI...")
    print(f"[*] Prompt: \"{prompt}\"")

    try:
        # Menggunakan model Soul v2 standard
        # Model lain yang didukung: higgsfield-ai/soul/v2/standard, seedance, kling, wan, dll.
        response = client.create_generation(
            model="higgsfield-ai/soul/v2/standard",
            prompt=prompt
        )
        print(f"[+] Permintaan berhasil dibuat!")
        print(f"    Request ID : {response.get('request_id')}")
        print(f"    Status     : {response.get('status')}")
        
        status_url = response.get("status_url")
        if status_url:
            print(f"[*] Memulai polling status...")
            result = client.wait_for_completion(status_url)
            print(f"[+] Generasi Selesai!")
            print(f"    Hasil: {result}")
        else:
            print(f"    Response: {response}")

    except Exception as e:
        print(f"[-] Terjadi kesalahan: {e}")

if __name__ == "__main__":
    main()
