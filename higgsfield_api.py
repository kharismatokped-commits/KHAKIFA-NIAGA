#!/usr/bin/env python3
"""
Higgsfield AI API Client
Integrasi dengan API Higgsfield (https://api.higgsfield.ai)
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Base configuration
BASE_URL = "https://api.higgsfield.ai"

def load_env(env_path=None):
    """Load key-value pairs from .env file into os.environ if not already set."""
    if env_path is None:
        env_path = Path(__file__).parent / ".env"
    else:
        env_path = Path(env_path)

    if env_path.is_file():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and key not in os.environ:
                        os.environ[key] = val

# Load .env automatically
load_env()

class HiggsfieldClient:
    def __init__(self, key_id=None, key_secret=None):
        self.key_id = key_id or os.environ.get("HF_KEY_ID")
        self.key_secret = key_secret or os.environ.get("HF_KEY_SECRET")

        if not self.key_id or not self.key_secret:
            # Check combined HF_KEY or HIGGSFIELD_API_KEY (format: key_id:key_secret)
            combined = os.environ.get("HF_KEY") or os.environ.get("HIGGSFIELD_API_KEY")
            if combined and ":" in combined:
                self.key_id, self.key_secret = combined.split(":", 1)

        if not self.key_id or not self.key_secret:
            raise ValueError(
                "Higgsfield credentials not found! Pastikan HF_KEY_ID dan HF_KEY_SECRET ada di .env atau environment variables."
            )

    @property
    def auth_header(self):
        return f"Key {self.key_id}:{self.key_secret}"

    def _request(self, method, endpoint_or_url, payload=None):
        if endpoint_or_url.startswith("http://") or endpoint_or_url.startswith("https://"):
            url = endpoint_or_url
        else:
            url = f"{BASE_URL.rstrip('/')}/{endpoint_or_url.lstrip('/')}"

        headers = {
            "Authorization": self.auth_header,
            "Content-Type": "application/json",
            "User-Agent": "Higgsfield-Client-Python/1.0"
        }

        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as resp:
                resp_body = resp.read().decode("utf-8")
                return resp.status, json.loads(resp_body) if resp_body else {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            try:
                err_json = json.loads(err_body)
            except Exception:
                err_json = {"raw": err_body}
            return e.code, err_json

    def test_connection(self):
        """
        Tes validasi koneksi ke Higgsfield API tanpa mengurangi saldo kredit.
        Mengirim payload kosong ke endpoint model; status 422 memvalidasi bahwa API key diterima & valid.
        """
        print(f"[*] Menguji koneksi Higgsfield API dengan Key ID: {self.key_id[:8]}...{self.key_id[-4:]}")
        status, resp = self._request("POST", "/higgsfield-ai/soul/v2/standard", payload={})

        if status == 422:
            print("[+] KONEKSI BERHASIL: API Key terverifikasi aktif dan diterima oleh Higgsfield AI!")
            return True, "Authenticated successfully"
        elif status in (401, 403):
            print(f"[-] KONEKSI GAGAL: Autentikasi ditolak (Status {status}). Periksa Key ID & Secret Anda.")
            return False, f"Auth failed with status {status}: {resp}"
        elif status == 200 or status == 201:
            print("[+] KONEKSI BERHASIL: API Key terverifikasi!")
            return True, "Authenticated successfully"
        else:
            print(f"[?] Respons dari Higgsfield API (Status {status}): {resp}")
            return False, f"Unexpected status {status}: {resp}"

    def create_generation(self, model="higgsfield-ai/soul/v2/standard", prompt=None, **params):
        """
        Mengirim permintaan pembuatan gambar / video.
        """
        payload = {"prompt": prompt} if prompt else {}
        payload.update(params)

        status, resp = self._request("POST", model, payload=payload)
        if status not in (200, 201, 202):
            raise RuntimeError(f"Gagal membuat generasi (Status {status}): {resp}")
        return resp

    def get_status(self, status_url):
        """
        Cek status progress generasi melalui status_url.
        """
        status, resp = self._request("GET", status_url)
        return resp

    def wait_for_completion(self, status_url, interval_sec=3, timeout_sec=180):
        """
        Poll status URL hingga pekerjaan selesai.
        """
        print(f"[*] Menunggu hasil dari: {status_url}")
        start = time.time()
        while time.time() - start < timeout_sec:
            res = self.get_status(status_url)
            state = res.get("status")
            print(f"    - Status: {state}")
            if state in ("completed", "succeeded", "done"):
                return res
            elif state in ("failed", "error"):
                raise RuntimeError(f"Generasi gagal: {res}")
            time.sleep(interval_sec)
        raise TimeoutError("Waktu tunggu habis (timeout).")

if __name__ == "__main__":
    client = HiggsfieldClient()
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        success, msg = client.test_connection()
        sys.exit(0 if success else 1)
    else:
        success, msg = client.test_connection()
        print("\nPetunjuk Penggunaan:")
        print("  1. Tes koneksi: python3 higgsfield_api.py test")
        print("  2. Gunakan di skrip lain: from higgsfield_api import HiggsfieldClient")
