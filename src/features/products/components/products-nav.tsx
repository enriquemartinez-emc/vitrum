"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard/products/window-types", label: "Window Types" },
  { href: "/dashboard/products/glass-types", label: "Glass Types" },
]

export function ProductsNav() {
  const pathname = usePathname()

  return (
    <nav className="inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm dark:bg-input/30"
                : "text-foreground/60 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
