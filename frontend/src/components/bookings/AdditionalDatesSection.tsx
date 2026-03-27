import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AdditionalDate {
  id: string;
  date: Date;
  time: string;
  isDatePickerOpen?: boolean;
}

interface AdditionalDatesSectionProps {
  additionalDates: AdditionalDate[];
  timeSlots: [string, string][];
  isLoadingTimeSlots: boolean;
  onAddDate: () => void;
  onRemoveDate: (idToRemove: string) => void;
  onUpdateAdditionalDate: (id: string, date: Date) => void;
  onUpdateAdditionalTime: (id: string, time: string) => void;
  onDatePickerOpenChange: (id: string, isOpen: boolean) => void;
}

const AdditionalDatesSection = ({
  additionalDates,
  timeSlots,
  isLoadingTimeSlots,
  onAddDate,
  onRemoveDate,
  onUpdateAdditionalDate,
  onUpdateAdditionalTime,
  onDatePickerOpenChange,
}: AdditionalDatesSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Extra Date &amp; Time (Optional)
      </h3>

      {additionalDates.length > 0 && (
        <div className="space-y-4">
          {additionalDates.map((additionalDate) => (
            <div key={additionalDate.id} className="relative rounded-md border border-border bg-muted/35 p-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                onClick={() => onRemoveDate(additionalDate.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Popover
                    open={additionalDate.isDatePickerOpen}
                    onOpenChange={(isOpen) => onDatePickerOpenChange(additionalDate.id, isOpen)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start border-border bg-background pl-3 text-left font-normal text-foreground")}
                      >
                        {additionalDate.date ? format(additionalDate.date, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-border bg-popover p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={additionalDate.date}
                        onSelect={(date) => date && onUpdateAdditionalDate(additionalDate.id, date)}
                        initialFocus
                        className={cn("pointer-events-auto p-3")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <Select onValueChange={(value) => onUpdateAdditionalTime(additionalDate.id, value)} defaultValue={additionalDate.time}>
                    <SelectTrigger disabled={isLoadingTimeSlots} className="border-border bg-background text-foreground">
                      <SelectValue placeholder={isLoadingTimeSlots ? "Loading..." : "Select a time"} />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      {timeSlots.map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-foreground focus:bg-muted">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onAddDate}
        className="h-11 w-full border-2 border-primary/60 bg-background text-base font-medium text-primary hover:bg-primary/5"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add an extra date &amp; time
      </Button>
    </div>
  );
};

export default AdditionalDatesSection;
export type { AdditionalDate };
