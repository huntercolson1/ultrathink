"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FadeIn } from "@/components/fade-in"
import { formatDateShort } from "@/lib/format"

interface WritingEntry {
  slug: string
  type: "post" | "tutorial"
  title: string
  subtitle: string
  description: string
  date: string
  readingTime: number
}

type Kind = "all" | "post" | "tutorial"

function hrefFor(type: string, slug: string) {
  return type === "tutorial" ? `/tutorials/${slug}` : `/blog/${slug}`
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
}

function groupByYear(entries: WritingEntry[]) {
  const grouped = new Map<string, WritingEntry[]>()

  for (const entry of entries) {
    const year = entry.date.slice(0, 4)
    const existing = grouped.get(year) ?? []
    existing.push(entry)
    grouped.set(year, existing)
  }

  return Array.from(grouped.entries()).map(([year, items]) => ({ year, items }))
}

function WritingRowLink({
  entry,
  showTypeBadge,
}: {
  entry: WritingEntry
  showTypeBadge: boolean
}) {
  const summary = entry.subtitle || entry.description

  return (
    <Link
      href={hrefFor(entry.type, entry.slug)}
      className="group grid gap-3 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_5.5rem] sm:items-start sm:gap-6"
    >
      <div className="text-caption-prose flex items-center gap-3 text-muted-foreground/60 sm:pt-1">
        <time dateTime={entry.date}>{formatDateShort(entry.date)}</time>
        {showTypeBadge && (
          <Badge
            variant="secondary"
            className="text-badge-type font-normal text-muted-foreground/70 sm:hidden"
          >
            {entry.type === "tutorial" ? "Tutorial" : "Post"}
          </Badge>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body font-medium text-foreground transition-colors duration-300 group-hover:text-accent-warm">
            {entry.title}
          </span>
          {showTypeBadge && (
            <Badge
              variant="secondary"
              className="text-badge-type hidden font-normal text-muted-foreground/70 sm:inline-flex"
            >
              {entry.type === "tutorial" ? "Tutorial" : "Post"}
            </Badge>
          )}
        </div>
        {summary && (
          <p className="text-body text-muted-foreground">{summary}</p>
        )}
      </div>
      <div className="text-caption-prose text-muted-foreground/60 sm:pt-1 sm:text-right">
        {entry.readingTime} min
      </div>
    </Link>
  )
}

export function WritingList({ items }: { items: WritingEntry[] }) {
  const [kind, setKind] = useState<Kind>("all")
  const reducedMotion = useReducedMotion()

  const rows = useMemo(() => {
    if (kind === "all") return items
    return items.filter((i) => i.type === kind)
  }, [kind, items])

  const featured = rows[0] ?? null
  const archive = featured ? rows.slice(1) : rows
  const groups = useMemo(() => groupByYear(archive), [archive])
  const postCount = items.filter((item) => item.type === "post").length
  const tutorialCount = items.filter((item) => item.type === "tutorial").length

  return (
    <FadeIn>
      <div className="grid gap-12 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(0,1.35fr)] lg:gap-16">
        <div className="flex flex-col gap-6 lg:sticky lg:top-10 lg:self-start">
          <div className="flex flex-col gap-4">
            <h1 className="text-title-h1">Writing</h1>
            <p className="text-body max-w-md text-muted-foreground">
              Essays, notes, and tutorials on medicine, engineering, AI, and the
              mechanics of learning.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-border/60 py-5 lg:grid-cols-1">
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow-ui text-muted-foreground/55">
                Total
              </span>
              <span className="text-section-title">{items.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow-ui text-muted-foreground/55">
                Posts
              </span>
              <span className="text-section-title">{postCount}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow-ui text-muted-foreground/55">
                Tutorials
              </span>
              <span className="text-section-title">{tutorialCount}</span>
            </div>
          </div>

          <ToggleGroup
            type="single"
            value={kind}
            onValueChange={(v) => {
              if (v) setKind(v as Kind)
            }}
            size="sm"
            variant="outline"
            className="w-fit"
          >
            <ToggleGroupItem value="all" className="px-3 text-xs">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="post" className="px-3 text-xs">
              Posts
            </ToggleGroupItem>
            <ToggleGroupItem value="tutorial" className="px-3 text-xs">
              Tutorials
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-10">
          {featured && (
            <article className="flex flex-col gap-4 border-y border-border/60 py-6">
              <div className="text-caption-prose flex flex-wrap items-center gap-3 text-muted-foreground/60">
                <span className="text-eyebrow-ui text-accent-warm/80">
                  Latest
                </span>
                <span>{formatDateShort(featured.date)}</span>
                <span>{featured.readingTime} min read</span>
              </div>
              <Link
                href={hrefFor(featured.type, featured.slug)}
                className="group flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-section-title transition-colors duration-300 group-hover:text-accent-warm">
                    {featured.title}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="text-badge-type font-normal text-muted-foreground/70"
                  >
                    {featured.type === "tutorial" ? "Tutorial" : "Post"}
                  </Badge>
                </div>
                {(featured.subtitle || featured.description) && (
                  <p className="text-body max-w-[46rem] text-muted-foreground">
                    {featured.subtitle || featured.description}
                  </p>
                )}
              </Link>
            </article>
          )}

          {rows.length > 0 &&
            (reducedMotion ? (
              <div key={kind} className="flex flex-col gap-10">
                {groups.map((group) => (
                  <section key={group.year} className="flex flex-col gap-3">
                    <h2 className="text-eyebrow-ui text-muted-foreground/55">
                      {group.year}
                    </h2>
                    <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                      {group.items.map((entry) => (
                        <WritingRowLink
                          key={`${entry.type}-${entry.slug}`}
                          entry={entry}
                          showTypeBadge={kind === "all"}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <motion.div
                key={kind}
                className="flex flex-col gap-10"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {groups.map((group) => (
                  <motion.section
                    key={group.year}
                    className="flex flex-col gap-3"
                    variants={item}
                  >
                    <h2 className="text-eyebrow-ui text-muted-foreground/55">
                      {group.year}
                    </h2>
                    <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                      {group.items.map((entry) => (
                        <WritingRowLink
                          key={`${entry.type}-${entry.slug}`}
                          entry={entry}
                          showTypeBadge={kind === "all"}
                        />
                      ))}
                    </div>
                  </motion.section>
                ))}
              </motion.div>
            ))}

          {rows.length === 0 && (
            <p className="text-body py-12 text-center text-muted-foreground/60">
              Nothing here yet.
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  )
}
