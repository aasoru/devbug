import ChronometerComponent from '@/components/Chronometer';

import {
  Card,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ToolTitle } from '@/components/ToolTitle';

export default function Chronometer() {
  return (
    <div>
      {/* <Head title="Chronometer" /> */}
      <Card variant="page">
        <ToolTitle href="/chronometer">Chronometer</ToolTitle>
        <div className="py-4" />
        <CardDescription>
          A chronometer is a precision watch used to measure very small
          fractions of time.
        </CardDescription>

        <CardContent>
          <ChronometerComponent />
        </CardContent>
      </Card>
    </div>
  );
}
