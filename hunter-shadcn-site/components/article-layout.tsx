"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { type ReactNode } from "react"

import { FadeIn } from "@/components/fade-in"
import { GenerativeHero } from "@/components/generative-hero"
import { ReadingProgress } from "@/components/reading-progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"

interface ArticleLayoutProps {
  title: string
  subtitle?: string
  slug?: string
  date: string
  readingTime: number
  type?: "post" | "tutorial"
  children: ReactNode
}

export function ArticleLayout({
  title,
  subtitle,
  slug,
  date,
  readingTime,
  type,
  children,
}: ArticleLayoutProps) {
  return (
    <>
      <ReadingProgress />
      <FadeIn>
        <article className="mx-auto flex max-w-[44rem] flex-col gap-10">
          <header className="flex flex-col gap-3">
            <Link
              href="/writing"
              className="group flex w-fit items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-accent-warm"
            >
              <ArrowLeftIcon
                data-icon="inline-start"
                className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-x-0.5"
              />
              Writing
            </Link>
            {slug && (
              <GenerativeHero seed={slug} variant="banner" className="mt-1" />
            )}
            <h1 className="text-title-h1">{title}</h1>
            {subtitle && (
              <p className="text-body text-muted-foreground">{subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-none text-muted-foreground/60">
              <time dateTime={date}>{formatDate(date)}</time>
              <Separator
                orientation="vertical"
                className="!h-[1em] !self-center"
              />
              <span>{readingTime} min read</span>
              {type && (
                <>
                  <Separator
                    orientation="vertical"
                    className="!h-[1em] !self-center"
                  />
                  <Badge
                    variant="secondary"
                    className="text-[0.625rem] font-normal text-muted-foreground/70"
                  >
                    {type === "tutorial" ? "Tutorial" : "Post"}
                  </Badge>
                </>
              )}
            </div>
          </header>

          <Separator />

          {children}

          <Separator />

          <footer>
            <Link
              href="/writing"
              className="group flex w-fit items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-accent-warm"
            >
              <ArrowLeftIcon
                data-icon="inline-start"
                className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-x-0.5"
              />
              All writing
            </Link>
          </footer>
        </article>
      </FadeIn>
    </>
  )
}
