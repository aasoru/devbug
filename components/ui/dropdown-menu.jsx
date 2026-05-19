"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"

const DropdownContext = React.createContext({})

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onEscape = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
  const { open, setOpen } = React.useContext(DropdownContext)
  const handleClick = () => setOpen((prev) => !prev)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': true,
      ...props,
    })
  }
  return (
    <button onClick={handleClick} aria-expanded={open} aria-haspopup {...props}>
      {children}
    </button>
  )
}

const DropdownMenuContent = React.forwardRef(({ className, align = 'start', ...props }, ref) => {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null
  return (
    <div
      ref={ref}
      role="menu"
      className={twMerge(
        "absolute z-50 top-full mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { setOpen } = React.useContext(DropdownContext)
  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      className={twMerge(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={() => { onClick?.(); setOpen(false) }}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
