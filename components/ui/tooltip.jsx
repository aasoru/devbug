"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"

const TooltipContext = React.createContext({})

const TooltipProvider = ({ children }) => children

const Tooltip = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = ({ children, asChild, ...props }) => {
  const { setOpen } = React.useContext(TooltipContext)
  const handlers = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  }
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...handlers, ...props })
  }
  return <span {...handlers} {...props}>{children}</span>
}

const TooltipContent = React.forwardRef(({ className, ...props }, ref) => {
  const { open } = React.useContext(TooltipContext)
  if (!open) return null
  return (
    <div
      ref={ref}
      className={twMerge(
        "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
