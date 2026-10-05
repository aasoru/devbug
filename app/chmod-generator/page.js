import ChmodGenerator from '@/components/ChmodGenerator';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ToolTitle } from '@/components/ToolTitle';

export default function ChmodGeneratorPage() {
  return (
    <div>
      <Card variant="page">
        <ToolTitle href="/chmod-generator">CHMOD Generator</ToolTitle>
        <div className="py-4" />
        <CardDescription>
          Calculate Unix file permissions. Toggle bits or type a permission string (e.g. <code>755</code> or <code>rwxr-xr-x</code>) to update the values.
        </CardDescription>
        <CardContent>
          <ChmodGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
