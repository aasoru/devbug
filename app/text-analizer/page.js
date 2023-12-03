//import Card from '@/components/Card';
import TextAnalizerComponent from '@/components/TextAnalizer';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

export default function TextAnalizer() {
  return (
    <div className="py-6">
      <Card>
        <CardTitle>Text Analizer</CardTitle>
        <div className="py-4" />
        <CardDescription>Text analyzer</CardDescription>
        <CardContent>
          <div className="py-2" />
          <TextAnalizerComponent />
        </CardContent>
      </Card>
    </div>
  );
}
