import { ViewTransition } from 'react';

import { CardTitle } from '@/components/ui/card';
import { toolTitleName } from '@/shared/viewTransitions';

// A tool's page title. Same name as its home card's title, so on navigation the card's title
// morphs into this one (and back): "what you clicked is this".
export function ToolTitle({ href, children }) {
  return (
    <ViewTransition name={toolTitleName(href)} share="morph" default="none">
      <CardTitle>{children}</CardTitle>
    </ViewTransition>
  );
}
