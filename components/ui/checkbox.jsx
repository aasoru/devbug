"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { twMerge } from "tailwind-merge"

const Checkbox = React.forwardRef(({ className, checked, ...props }, ref) => (
  <button
    ref={ref}
    role="checkbox"
    aria-checked={checked}
    className={twMerge(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
      checked && "bg-primary text-primary-foreground",
      className
    )}
    {...props}
  >
    {checked && <Check className="h-3 w-3" />}
  </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
