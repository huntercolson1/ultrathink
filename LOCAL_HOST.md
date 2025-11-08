# 🖥️ Local Hosting Guide

## Quick Start (Easiest Method)

### Step 1: Start Docker Desktop

1. Open **Docker Desktop** application on your Mac
2. Wait for it to fully start (whale icon in menu bar should be steady)
3. You'll know it's ready when the Docker icon stops animating

### Step 2: Run the Start Script

```bash
cd /Users/huntercolson/Documents/Projects/hunter-site
./start-local.sh
```

**That's it!** Your site will be running at **http://localhost:4000**

---

## Alternative: Manual Docker Command

If you prefer to run Docker manually:

```bash
cd /Users/huntercolson/Documents/Projects/hunter-site
docker run -it --rm \
  -v "$PWD":/srv/jekyll \
  -p 4000:4000 \
  jekyll/jekyll:4.3 \
  jekyll serve --host 0.0.0.0 --force_polling
```

Then open **http://localhost:4000** in your browser.

---

## 🛑 To Stop the Server

Press `Ctrl+C` in the terminal where Jekyll is running.

---

## 🔧 Troubleshooting

### Docker Not Starting?

1. **Check if Docker Desktop is installed:**
   ```bash
   which docker
   ```
   If nothing shows, install from: https://www.docker.com/products/docker-desktop

2. **Start Docker Desktop manually:**
   ```bash
   open -a Docker
   ```

3. **Wait for Docker to fully start** (check menu bar icon)

### Port 4000 Already in Use?

Use a different port:
```bash
docker run -it --rm \
  -v "$PWD":/srv/jekyll \
  -p 4001:4000 \
  jekyll/jekyll:4.3 \
  jekyll serve --host 0.0.0.0 --force_polling
```
Then open **http://localhost:4001**

### Changes Not Showing?

- Jekyll auto-reloads on file changes
- Hard refresh your browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check terminal for any error messages

---

## ✅ What You Should See

When running successfully, you'll see:
```
Server address: http://0.0.0.0:4000/
Server running... press ctrl-c to stop.
```

Then open **http://localhost:4000** in your browser to see your site!

---

## 📝 Notes

- **Docker method is recommended** because it avoids Ruby version compatibility issues
- The site runs exactly as it will on GitHub Pages
- All changes to files are automatically detected and rebuilt
- No need to install Ruby or manage gem dependencies

