import JsonMinifier from '@/components/JsonMinifier';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ToolTitle } from '@/components/ToolTitle';

export default function JsonMinifierPage() {
  return (
    <div>
      <Card variant="page" className="max-w-none">
        <ToolTitle href="/json-minifier">JSON Minifier</ToolTitle>
        <div className="py-4" />
        <CardDescription>Minify or prettify JSON. Paste your JSON on the left and get the result on the right.</CardDescription>
        <CardContent>
          <div className="py-2" />
          <JsonMinifier />
        </CardContent>
      </Card>
    </div>
  );
}
