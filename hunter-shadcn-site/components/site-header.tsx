"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const nav = [
  { label: "About", href: "/" },
  { label: "Writing", href: "/writing" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const reducedMotion = useReducedMotion()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="flex items-center justify-between pt-10 pb-2 md:pt-14">
      <Link
        href="/"
        className="text-nav-brand text-foreground transition-opacity duration-300 hover:opacity-70"
      >
        Hunter Colson
      </Link>

      <div className="flex items-center gap-1">
        <nav className="hidden items-center sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-nav-item relative px-3 py-1.5 transition-colors duration-300",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive(item.href) &&
                (reducedMotion ? (
                  <span className="absolute inset-0 rounded-md bg-muted" />
                ) : (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md bg-muted"
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.5,
                    }}
                  />
                ))}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
              className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <SunIcon className="scale-100 motion-safe:transition-transform motion-safe:duration-300 dark:scale-0" />
              <MoonIcon className="absolute scale-0 motion-safe:transition-transform motion-safe:duration-300 dark:scale-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle theme</TooltipContent>
        </Tooltip>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground sm:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-52">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="flex flex-col gap-1 pt-8">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-nav-item px-3 py-2 transition-colors duration-300",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
