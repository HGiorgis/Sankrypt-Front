# 🛡️ Sankrypt — Secure Vault & Secrets Manager

_A modern, privacy-first vault system built on zero-knowledge principles._

Sankrypt is a secure, client-side encrypted platform for managing passwords, secrets, and digital vault items.
Inspired by the African _Sankofa_ philosophy — **“return and retrieve what is valuable”** — Sankrypt combines cultural heritage with state-of-the-art cryptography.

This repository contains the **frontend application** that interacts with the Laravel-based Sankrypt API.

---

## ✨ Core Features

- **🔐 Zero-Knowledge Design** — Encryption & decryption happen _only_ on the client.
- **🧩 Secure Vault System** — Store secrets as encrypted blobs with integrity checks.
- **🔑 Master Key Architecture** — A client-generated master key protects all vault data.
- **👤 Secure Authentication** — Login via derived hash instead of raw passwords.
- **📁 Categorized Vault Items** — Organize secrets by type (banking, work, personal, etc.)
- **📊 Activity Logging** — Track login history and API actions (logged server-side).
- **📱 Responsive UI** — Works smoothly on both mobile and desktop.
- **⚡ Clean API Integration** — Communicates with Sankrypt API via Sanctum.

---

## 🖼️ Sample Screenshots

### 🔐 Login & Master Key Entry

![Screenshot](<./screenshots/Screenshot%20(1).png>)
_Users authenticate using derived cryptographic keys — no raw passwords sent._

---

### 🔑 Master Key Overview

![Screenshot](<./screenshots/Screenshot%20(2).png>)
_Your master key encrypts and decrypts all private vault data locally._

---

### 🏺 Vault Categories

![Screenshot](<./screenshots/Screenshot%20(3).png>)
_Easily manage groups of secrets: banking, work, personal, developer keys, and more._

---

### 📦 Vault Item Details

![Screenshot](<./screenshots/Screenshot%20(4).png>)
_All vault items are encrypted objects stored securely in the backend._

---

## 🧠 Security Architecture

### 🔐 1. Local Encryption & Decryption

Sankrypt uses **client-side AES encryption** for all vault data:

- Raw secret → encrypted using the master key
- Only encrypted blobs are sent to the API
- API **never** sees plain secrets
- Hashes & salts ensure integrity & uniqueness

This is the foundation of the **Zero-Knowledge Model**.

---

### 🗝️ 2. Master Key System

Each user has a **Master Encryption Key**, generated locally during registration.

It is **never uploaded, saved, or cached permanently**.

The workflow:

1. User creates password
2. System derives:

   - `auth_key_hash` → sent to API for login
   - `master_key` → stored only in browser memory

3. Vault items are encrypted with `master_key`
4. Logout clears everything from memory

---

### 🏺 3. Vault Structure

Each stored vault item includes:

| Field              | Description                     |
| ------------------ | ------------------------------- |
| `encrypted_data`   | AES encrypted JSON              |
| `encryption_salt`  | Random salt used for derivation |
| `data_hash`        | Hash to detect tampering        |
| `category`         | Logical grouping of items       |
| `version`          | Optional version control        |
| `last_accessed_at` | Updated every read              |

The API stores only **encrypted blobs** — meaning even if compromised, data remains unreadable.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Sankrypt API (Laravel + Sanctum)

---

### Installation

```bash
git clone https://github.com/HGiorgis/Sankrypt-Frontend.git
cd Sankrypt-Frontend
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm start
```

Then open:

```
http://localhost:3000
```

---

## 🔄 How Sankrypt Works

1. **User registers** → client creates master key + auth key hash
2. **Only the hash** is sent to the API
3. User logs in → receives a secure Sanctum token
4. When saving a vault item:

   - Item is encrypted locally
   - Encrypted blob is sent to API

5. API stores the blob and logs the action
6. When retrieving:

   - API returns encrypted data
   - Client decrypts using master key

7. Master key clears on logout

## 🤝 Support

For issues, feature requests, or security reports — please open an issue in this repository.

---

**Built by HGiorgis • Designed with African wisdom & modern cryptography**
