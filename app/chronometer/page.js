//import Card from '@/components/Card';
import ChronometerComponent from '@/components/Chronometer';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

export default function Chronometer() {
  return (
    <div className="py-6">
      {/* <Head title="Chronometer" /> */}
      <Card>
        <CardTitle>Chronometer</CardTitle>
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
