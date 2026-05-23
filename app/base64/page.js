import Base64 from '@/components/Base64';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

export default function Base64Page() {
  return (
    <div className="py-6">
      <Card className="max-w-5xl">
        <CardTitle>Base64 Encoder / Decoder</CardTitle>
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
