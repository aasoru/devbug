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
        <CardDescription>
          Decode and inspect JWT tokens. The header and payload are Base64URL-encoded JSON — not encrypted — so anyone can read them without a key.
          The signature is what proves the token hasn&apos;t been tampered with, and verifying it requires the secret or public key used to sign it.
          {' '}Learn more at <a href="https://jwt.io" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">jwt.io</a>.
        </CardDescription>
        <CardContent>
          <div className="py-2" />
          <JwtDecoder />
        </CardContent>
      </Card>
    </div>
  );
}
