import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface SectionEmptyRowProps {
  title: string;
  onAdd: () => void;
}

export function SectionEmptyRow({ title, onAdd }: SectionEmptyRowProps) {
  return (
    <div className="flex items-center justify-between pl-4 pr-1 py-1">
      <span className="text-sm font-semibold">{title}</span>
      <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
      </Button>
    </div>
  );
}
