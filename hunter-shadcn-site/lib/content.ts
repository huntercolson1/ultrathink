import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

export interface Article {
  slug: string
  type: "post" | "tutorial"
  title: string
  subtitle: string
  description: string
  date: string
  author: string
  tags: string[]
  body: string
}

const REPO_ROOT = path.resolve(process.cwd(), "..")

function parseArticles(dir: string, type: "post" | "tutorial"): Article[] {
  const fullDir = path.join(REPO_ROOT, dir)
  if (!fs.existsSync(fullDir)) return []

  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(fullDir, filename), "utf-8")
      const { data, content } = matter(raw)

      const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-/)
      const fallbackDate = dateMatch ? dateMatch[1] : "2025-01-01"

      const slug = filename
        .replace(/^\d{4}-\d{2}-\d{2}-/, "")
        .replace(/\.md$/, "")

      const excerpt =
        data.description ||
        content
          .split(/\n\s*\n/)
          .map((chunk: string) =>
            chunk
              .replace(/^#+\s+/gm, "")
              .replace(/!\[[^\]]*]\([^)]*\)/g, "")
              .replace(/\[[^\]]*]\([^)]*\)/g, "")
              .replace(/[`*_>#-]/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          )
          .find(Boolean) ||
        ""

      let dateStr = fallbackDate
      if (data.date) {
        const d = data.date instanceof Date ? data.date : new Date(data.date)
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().slice(0, 10)
        }
      }

      return {
        slug,
        type,
        title: data.title || slug.replace(/-/g, " "),
        subtitle: data.subtitle || "",
        description: excerpt,
        date: dateStr,
        author: data.author || "Hunter Colson",
        tags: Array.isArray(data.tags)
          ? data.tags.map((t: string) => String(t).trim().toLowerCase())
          : [],
        body: content,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPosts(): Article[] {
  return parseArticles("_posts", "post")
}

export function getTutorials(): Article[] {
  return parseArticles("_tutorials", "tutorial")
}

export function getAllWriting(): Article[] {
  return [...getPosts(), ...getTutorials()].sort((a, b) =>
    a.date < b.date ? 1 : -1
  )
}

export function getArticle(
  type: "post" | "tutorial",
  slug: string
): Article | null {
  const all = type === "post" ? getPosts() : getTutorials()
  return all.find((a) => a.slug === slug) ?? null
}

export interface AboutData {
  name: string
  title: string
  tagline: string
  bio: string
  email: string
  social: { github: string; linkedin: string }
  now: { intro: string; projects: string[] }
  capabilities: string[]
}

export function getAbout(): AboutData {
  const raw = fs.readFileSync(
    path.join(REPO_ROOT, "_data", "about.yml"),
    "utf-8"
  )
  const { data } = matter(`---\n${raw}\n---`)

  return {
    name: data.name || "Hunter Colson",
    title: data.title || "About",
    tagline: data.tagline || "",
    bio: data.bio || "",
    email: data.email || "",
    social: {
      github: data.social?.github || "",
      linkedin: data.social?.linkedin || "",
    },
    now: data.now || { intro: "", projects: [] },
    capabilities: data.capabilities || [],
  }
}
