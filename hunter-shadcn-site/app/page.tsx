import Link from "next/link"

import { FadeInItem, FadeInStagger } from "@/components/fade-in"
import { GenerativeHero } from "@/components/generative-hero"
import { getAbout, getAllWriting } from "@/lib/content"
import { formatDateShort, readingTime } from "@/lib/format"

function hrefFor(type: "post" | "tutorial", slug: string) {
  return type === "tutorial" ? `/tutorials/${slug}` : `/blog/${slug}`
}

export default function HomePage() {
  const about = getAbout()
  const writing = getAllWriting()
  const latestWriting = writing.slice(0, 4).map((entry) => ({
    ...entry,
    href: hrefFor(entry.type, entry.slug),
    readingTime: readingTime(entry.body),
    summary: entry.subtitle || entry.description,
  }))
  const postCount = writing.filter((entry) => entry.type === "post").length
  const tutorialCount = writing.filter(
    (entry) => entry.type === "tutorial"
  ).length

  return (
    <FadeInStagger className="flex flex-col gap-16 md:gap-24">
      <section className="grid gap-12 border-b border-border/60 pb-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)] lg:gap-16">
        <FadeInItem className="flex flex-col gap-8">
          <header className="flex flex-col gap-6">
            <p className="text-eyebrow-ui text-muted-foreground/65">
              {about.tagline}
            </p>
            <div className="flex flex-col gap-5">
              <h1 className="text-title-h1 max-w-[11ch] sm:max-w-[13ch]">
                {about.title}
              </h1>
              <p className="text-body max-w-[42rem] text-muted-foreground">
                {about.bio}
              </p>
            </div>
            <nav className="text-nav-item flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <Link
                href="/writing"
                className="text-foreground underline decoration-border underline-offset-[3px] transition-colors duration-300 hover:text-accent-warm hover:decoration-accent-warm"
              >
                Writing
              </Link>
              {about.social.github && (
                <a
                  href={about.social.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground underline decoration-border underline-offset-[3px] transition-colors duration-300 hover:text-accent-warm hover:decoration-accent-warm"
                >
                  GitHub
                </a>
              )}
              {about.social.linkedin && (
                <a
                  href={about.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground underline decoration-border underline-offset-[3px] transition-colors duration-300 hover:text-accent-warm hover:decoration-accent-warm"
                >
                  LinkedIn
                </a>
              )}
              {about.email && (
                <a
                  href={`mailto:${about.email}`}
                  className="text-muted-foreground underline decoration-border underline-offset-[3px] transition-colors duration-300 hover:text-accent-warm hover:decoration-accent-warm"
                >
                  Email
                </a>
              )}
            </nav>
          </header>

          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/35 px-5 pt-5">
            <GenerativeHero
              seed={7}
              variant="hero"
              className="h-[140px] sm:h-[190px]"
            />
          </div>
        </FadeInItem>

        <FadeInItem className="flex flex-col gap-8 lg:pt-1">
          <div className="grid grid-cols-3 gap-4 border-y border-border/60 py-5">
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
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow-ui text-muted-foreground/55">
                In Motion
              </span>
              <span className="text-section-title">
                {about.now.projects.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-eyebrow-ui text-muted-foreground/55">
              What This Site Holds
            </h2>
            <p className="text-body text-muted-foreground">
              Notes from medicine, engineering, and AI work: some reflective,
              some technical, all meant to be useful enough to revisit.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-eyebrow-ui text-muted-foreground/55">
                Latest Writing
              </h2>
              <Link
                href="/writing"
                className="text-caption-prose text-muted-foreground underline decoration-transparent underline-offset-[3px] transition-colors duration-300 hover:text-accent-warm hover:decoration-accent-warm"
              >
                View archive
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
              {latestWriting.slice(0, 3).map((entry) => (
                <Link
                  key={`${entry.type}-${entry.slug}`}
                  href={entry.href}
                  className="group flex flex-col gap-2 py-4"
                >
                  <div className="text-caption-prose flex items-center gap-3 text-muted-foreground/60">
                    <span>
                      {entry.type === "tutorial" ? "Tutorial" : "Post"}
                    </span>
                    <span>{formatDateShort(entry.date)}</span>
                  </div>
                  <span className="text-section-title transition-colors duration-300 group-hover:text-accent-warm">
                    {entry.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </FadeInItem>
      </section>

      <section className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-16">
        <FadeInItem>
          <section className="flex flex-col gap-5">
            <h2 className="text-eyebrow-ui text-muted-foreground/55">Now</h2>
            <p className="text-body max-w-[42rem] text-muted-foreground">
              {about.now.intro}
            </p>
            <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
              {about.now.projects.map((project, index) => (
                <div
                  key={project}
                  className="grid gap-3 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5"
                >
                  <span className="text-eyebrow-ui text-accent-warm/80">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <p className="text-body text-muted-foreground">{project}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeInItem>

        {about.capabilities.length > 0 && (
          <FadeInItem>
            <section className="flex flex-col gap-5">
              <h2 className="text-eyebrow-ui text-muted-foreground/55">
                Focus
              </h2>
              <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                {about.capabilities.map((capability) => (
                  <div key={capability} className="py-4">
                    <p className="text-body text-foreground">{capability}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeInItem>
        )}
      </section>

      <FadeInItem>
        <section className="grid gap-8 border-t border-border/60 pt-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-eyebrow-ui text-muted-foreground/55">
              Selected Notes
            </h2>
            <p className="text-body max-w-sm text-muted-foreground">
              A few recent pieces that show the range of the site: essays,
              technical walkthroughs, and notes about tools worth paying
              attention to.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
            {latestWriting.map((entry) => (
              <Link
                key={`${entry.type}-${entry.slug}-selected`}
                href={entry.href}
                className="group grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-start sm:gap-6"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-caption-prose flex items-center gap-3 text-muted-foreground/60">
                    <span>
                      {entry.type === "tutorial" ? "Tutorial" : "Post"}
                    </span>
                    <span>{entry.readingTime} min read</span>
                  </div>
                  <span className="text-section-title transition-colors duration-300 group-hover:text-accent-warm">
                    {entry.title}
                  </span>
                  {entry.summary && (
                    <p className="text-body text-muted-foreground">
                      {entry.summary}
                    </p>
                  )}
                </div>
                <div className="text-caption-prose text-muted-foreground/60 sm:pt-1 sm:text-right">
                  {formatDateShort(entry.date)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </FadeInItem>
    </FadeInStagger>
  )
}
