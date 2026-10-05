import Base64 from '@/components/Base64';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ToolTitle } from '@/components/ToolTitle';

export default function Base64Page() {
  return (
    <div>
      <Card variant="page" className="max-w-5xl">
        <ToolTitle href="/base64">Base64 Encoder / Decoder</ToolTitle>
        <div className="py-4" />
        <CardDescription>Encode text to Base64 or decode Base64 back to text. Supports UTF-8.</CardDescription>
        <CardContent>
          <div className="py-2" />
          <Base64 />
        </CardContent>
      </Card>
    </div>
  );
}
