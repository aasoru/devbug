import JsonMinifier from '@/components/JsonMinifier';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

export default function JsonMinifierPage() {
  return (
    <div className="py-6">
      <Card>
        <CardTitle>JSON Minifier</CardTitle>
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
