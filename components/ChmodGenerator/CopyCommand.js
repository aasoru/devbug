import CopyErrorAlert from '@/components/CopyErrorAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { copyLabel, useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import ContentCopyIcon from '@/public/images/icons/content-copy.svg';

// The chmod command, read-only, with a button to copy it.
export function CopyCommand({ command }) {
  const { copy, status, error, dismissError } = useCopyToClipboard();
  return (
    <>
      <div className="flex w-full max-w-sm mx-auto items-center gap-2">
        <Input value={command} readOnly />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => copy(command)} aria-label="Copy to clipboard">
                <ContentCopyIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copyLabel(status, 'Copy to clipboard')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <CopyErrorAlert message={error} onDismiss={dismissError} className="max-w-sm mx-auto" />
    </>
  );
}
