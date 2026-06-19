import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TipTapContentViewer } from "../TipTapContentViewer";

interface SummarySectionCardProps {
  summary: string;
  onEdit: () => void;
}

function SummarySectionCard({ summary, onEdit }: SummarySectionCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row justify-between relative">
        <CardTitle>Summary</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 absolute top-0 right-1"
          onClick={onEdit}
        >
          <Edit className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Edit
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <TipTapContentViewer content={summary} />
      </CardContent>
    </Card>
  );
}

export default SummarySectionCard;
