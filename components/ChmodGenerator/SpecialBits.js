import { Checkbox } from '@/components/ui/checkbox';

const SPECIAL = [
  { key: 'setuid', label: 'Setuid', value: 4000 },
  { key: 'setgid', label: 'Setgid', value: 2000 },
  { key: 'sticky', label: 'Sticky', value: 1000 },
];

// Setuid, setgid and sticky: the optional fourth (leading) octal digit.
export function SpecialBits({ special, onToggle }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">Special bits</span>
      <div className="flex justify-center gap-8">
        {SPECIAL.map((bit) => (
          <div key={bit.key} className="flex flex-col items-center gap-2">
            <Checkbox
              className="h-8 w-8 mx-auto"
              checked={special[bit.key]}
              onClick={() => onToggle(bit.key)}
            />
            <span className="text-sm text-muted-foreground">{bit.label}</span>
            <span className="text-xs text-muted-foreground">{bit.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
