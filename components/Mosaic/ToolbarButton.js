import { Button } from '@/components/ui/button';

// A toolbar button: an icon and its label.
export const ToolbarButton = ({ icon: Icon, label, variant = 'outline', ...props }) => (
  <Button variant={variant} {...props}>
    <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
    {label}
  </Button>
);
