import JwtDecoder from '@/components/JwtDecoder';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

export default function JwtDecoderPage() {
  return (
    <div className="py-6">
      <Card>
        <CardTitle>JWT Decoder</CardTitle>
        <div className="py-4" />
        <CardDescription>Decode and inspect JWT tokens. Paste a token to see its header and payload.</CardDescription>
        <CardContent>
          <div className="py-2" />
          <JwtDecoder />
        </CardContent>
      </Card>
    </div>
  );
}
