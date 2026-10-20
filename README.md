# ⚡ FileDrop - Cross-Device Personal File Sharing

A lightweight, zero-login personal web app built for university students to quickly transfer files, documents, code snippets, notes, and pictures between phones, laptops, and lab PCs.

---

## 🌟 Key Features

- 📤 **Instant File Upload (up to 100 MB)**: Drag & drop single or multiple files (PDFs, code, images, ZIPs, docs).
- 📝 **Direct Text & Codelines Sharing**: A dedicated large text area to paste code, terminal output, or notes directly without saving to a file first.
- 🔑 **6-Character Secret Access Code**: Automatically generates a clean, easy-to-type code (e.g. `8A3F9C`).
- 📱 **QR Code Mobile Scanning**: Scan directly with your phone's camera to instantly open and download files without typing.
- ⬇️ **Cross-Device Simultaneous Download**: Any number of devices can download the same file at the same time.
- 👁 **Inline Previews**: Built-in preview modal for images and PDFs.
- 📂 **Recent Uploads Tab**: View active files on your server and access them with one click.
- ⏳ **90-Day Auto Cleanup**: Daily automated cron job cleans files older than 90 days.
- 💸 **100% Free Hosting**: Ready to deploy directly to Render free tier using `render.yaml`.

---

## 🚀 How to Run Locally

### Option 1: Double-Click `start.bat` (Recommended for Windows)

In Windows File Explorer, simply **double-click `start.bat`**!
- It automatically starts the backend server on port 3000.
- It automatically launches your web browser to **http://localhost:3000**.
- Keep the console window open while you use FileDrop.

---

### Option 2: Run via Terminal

```bash
cd backend
node server.js
```
Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Verification & Self-Test

You can verify all 10 core functions anytime by running:
```bash
node test_all_functions.js
```
This tests health check, frontend serving, single upload, batch upload, text snippet upload, access code query, file preview, forced download, recent files list, and cleanup script.

---

## ☁️ How to Host on Render (100% Free)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of FileDrop"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign in.
   - Click **New +** > **Blueprint**.
   - Connect your GitHub repository.
   - Render reads `render.yaml` automatically and creates:
     1. **Web Service (`file-share-app`)**: Free Node.js service that builds the frontend and runs the backend.
     2. **1 GB Persistent Disk**: Keeps uploaded files safe across restarts.
     3. **Daily Cron Job (`file-cleanup-job`)**: Deletes files older than 90 days at midnight UTC.
   - Click **Apply**!

Render will generate an HTTPS URL (e.g., `https://your-app.onrender.com`) that you can open on any phone, laptop, or lab computer anywhere in the world.
