import { twMerge } from "tailwind-merge"

// On/off option laid out like a Select: a button with role="switch" (no Radix). The label
// wraps it, so clicking the text toggles it too and gives it its accessible name.
const Switch = ({ label, checked, onChange }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="flex h-10 items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={twMerge(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span className={twMerge("inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </span>
  </label>
)

export { Switch }
