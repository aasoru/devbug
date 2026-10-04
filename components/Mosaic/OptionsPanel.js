import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FRAMES, gapPx, LEFTOVER, MAX_GAP, SIZES } from './options';

// Layout options. onChange(key, value) updates one option. (How many memes to load is asked
// next to the button that loads them.)
export function OptionsPanel({ options, onChange }) {
  const set = (key) => (value) => onChange(key, value);
  return (
    <div id="mosaic-options" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <Select label="Frame" value={options.frame} onChange={set('frame')} options={FRAMES} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Gap (px)</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_GAP}
          step={1}
          value={options.gap}
          onChange={(e) => onChange('gap', e.target.value)}
          onBlur={(e) => onChange('gap', String(gapPx(e.target.value)))}
        />
      </label>
      <Select label="Sizes" value={options.sizes} onChange={set('sizes')} options={SIZES} />
      <Select label="Leftover space" value={options.leftover} onChange={set('leftover')} options={LEFTOVER} />
      <Switch label="Reorder to fit" checked={options.reorder} onChange={set('reorder')} />
    </div>
  );
}
