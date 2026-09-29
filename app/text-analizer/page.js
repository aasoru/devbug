import TextAnalizerComponent from '@/components/TextAnalizer';

import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function TextAnalizer() {
  return (
    <div>
      <Card variant="page" className="max-w-none">
        <CardTitle>Text Analizer</CardTitle>
        <div className="py-4" />
        <CardContent>
          <TextAnalizerComponent description="Paste any text to get character, word, and line counts. Use the search field to count occurrences of a specific pattern." />
        </CardContent>
      </Card>
    </div>
  );
}
