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
      <Card className="max-w-none">
        <CardTitle>Text Analizer</CardTitle>
        <div className="py-4" />
        <CardDescription>Paste any text to get character, word, and line counts. Use the search field to count occurrences of a specific pattern.</CardDescription>
        <CardContent>
          <div className="py-2" />
          <TextAnalizerComponent />
        </CardContent>
      </Card>
    </div>
  );
}
