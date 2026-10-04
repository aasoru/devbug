import { ChevronDown } from "lucide-react"

// Native <select> (system picker on mobile, keyboard and screen readers work as usual), but with
// our own chevron: each browser draws and places the native arrow differently, often cramped.
// options: { value, label }[]; onChange receives the selected value.
const Select = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </span>
  </label>
)

export { Select }
