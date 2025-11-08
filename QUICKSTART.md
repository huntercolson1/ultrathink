# 🚀 Quick Start Guide

## Your Site is Ready!

Your Jekyll blog repository is **100% complete and ready to run**. All files are in place and properly configured.

## ⚡ Fastest Way to Run (Docker)

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your Mac.

### Step 2: Run This Command
```bash
cd /Users/huntercolson/Documents/Projects/hunter-site
docker run -it --rm \
  -v "$PWD":/srv/jekyll \
  -p 4000:4000 \
  jekyll/jekyll:4.3 \
  jekyll serve --host 0.0.0.0 --force_polling
```

### Step 3: Open Your Browser
**Go to: http://localhost:4000**

That's it! Your site is now running locally.

---

## 🎯 What You'll See

- **Homepage**: Clean landing page with links to Series, Blog, Projects, and About
- **Blog**: Your welcome post from `_blog/2025-11-08-welcome.md`
- **Series**: "Research for Medical Students" series with 2 posts
- **Projects**: Project showcase page
- **About**: Your bio page

---

## 📝 To Stop the Server

Press `Ctrl+C` in the terminal where Docker is running.

---

## 🔧 Alternative: If Docker Doesn't Work

If you have Ruby 3.2 or 3.3 installed (not 3.4):

```bash
cd /Users/huntercolson/Documents/Projects/hunter-site
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"  # Only if using Homebrew Ruby
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000

---

## ✅ Repository Status

Everything is configured and ready:
- ✅ Jekyll configuration
- ✅ Blog collection
- ✅ Series collection  
- ✅ All layouts and includes
- ✅ Custom CSS and JavaScript
- ✅ Theme integration (Just the Docs)
- ✅ Sample content

**The site is production-ready!**

