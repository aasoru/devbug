import { Button } from '@/components/ui/button';

// A toolbar button with an icon and a label. Compact (full screen): icon only — the label stays
// for screen readers and shows as a tooltip — so the toolbar fits one row on a phone.
export const ToolbarButton = ({ icon: Icon, label, compact, variant = 'outline', ...props }) => (
  <Button variant={variant} title={compact ? label : undefined} {...props}>
    <Icon className={compact ? 'h-4 w-4' : 'h-4 w-4 mr-2'} aria-hidden="true" />
    <span className={compact ? 'sr-only' : undefined}>{label}</span>
  </Button>
);
