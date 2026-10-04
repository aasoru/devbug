import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MAX_MEMES, MIN_MEMES } from './hooks/useMemes';
import { FRAMES, GAPS, LEFTOVER, SIZES } from './options';

// Layout options, plus how many memes to load. onChange(key, value) updates one option.
export function OptionsPanel({ options, onChange, memes }) {
  const set = (key) => (value) => onChange(key, value);
  return (
    <div id="mosaic-options" className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <Select label="Frame" value={options.frame} onChange={set('frame')} options={FRAMES} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Memes</span>
        <Input
          type="number"
          inputMode="numeric"
          min={MIN_MEMES}
          max={MAX_MEMES}
          step={1}
          value={memes.countDraft}
          onChange={(e) => memes.changeCount(e.target.value)}
          onBlur={(e) => memes.applyCount(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') memes.applyCount(e.currentTarget.value); }}
        />
      </label>
      <Select label="Gap" value={options.gap} onChange={set('gap')} options={GAPS} />
      <Select label="Sizes" value={options.sizes} onChange={set('sizes')} options={SIZES} />
      <Select label="Leftover space" value={options.leftover} onChange={set('leftover')} options={LEFTOVER} />
      <Switch label="Reorder to fit" checked={options.reorder} onChange={set('reorder')} />
    </div>
  );
}
