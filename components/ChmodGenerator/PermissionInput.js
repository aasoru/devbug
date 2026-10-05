import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRESETS } from './lib';

// Preset buttons, and a field for octal ("755") or symbolic ("rwxr-xr-x") notation.
export function PermissionInput({ value, invalid, onChange, onPreset }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <Button key={p.label} variant="outline" size="sm" onClick={() => onPreset(p.value)}>
            {p.label}
          </Button>
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="755 or rwxr-xr-x"
        className={invalid ? 'border-destructive' : ''}
      />
      {invalid && <p className="text-xs text-destructive">Invalid permission string.</p>}
    </div>
  );
}
