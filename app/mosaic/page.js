import Mosaic from '@/components/Mosaic';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

export default function MosaicPage() {
  return (
    <div>
      <Card variant="page" className="max-w-none">
        <CardTitle>Mosaic</CardTitle>
        <div className="py-4" />
        <CardDescription>
          Fits images of any size into a fixed frame without cropping them. It picks the arrangement that leaves the least empty space, and you choose what to do with what&apos;s left.
        </CardDescription>
        <CardContent>
          <div className="py-2" />
          <Mosaic />
        </CardContent>
      </Card>
    </div>
  );
}
