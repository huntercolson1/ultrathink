import type { Metadata } from "next"

import { getAllWriting } from "@/lib/content"
import { readingTime } from "@/lib/format"
import { WritingList } from "@/components/writing-list"

export const metadata: Metadata = { title: "Writing" }

export default function WritingPage() {
  const writing = getAllWriting().map((a) => ({
    slug: a.slug,
    type: a.type,
    title: a.title,
    subtitle: a.subtitle,
    description: a.description,
    date: a.date,
    readingTime: readingTime(a.body),
  }))

  return <WritingList items={writing} />
}
