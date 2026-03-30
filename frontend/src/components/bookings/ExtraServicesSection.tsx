import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service } from "@/types/interfaces";

interface ExtraServicesSectionProps {
  services: Service[];
  extraServiceIds: string[];
  onAddExtraService: (serviceId: string) => void;
  onRemoveExtraService: (serviceId: string) => void;
}

const ExtraServicesSection = ({
  services,
  extraServiceIds,
  onAddExtraService,
  onRemoveExtraService,
}: ExtraServicesSectionProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Extra Services (Optional)
      </Label>

      {extraServiceIds.length > 0 && (
        <div className="space-y-2">
          {extraServiceIds.map((serviceId) => {
            const service = services.find((s) => s.service_id.toString() === serviceId);
            return (
              <div key={serviceId} className="flex items-center justify-between rounded-md border border-border/70 bg-muted/40 p-3">
                <div>
                  <span className="font-medium text-foreground">{service?.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {service?.price > 0
                      ? `(£${service?.price.toFixed(2)})`
                      : service?.price < 0
                        ? `(-£${Math.abs(service?.price || 0).toFixed(2)})`
                        : "(Free)"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onRemoveExtraService(serviceId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Select onValueChange={onAddExtraService} key={extraServiceIds.length}>
        <SelectTrigger className="h-11 w-full border-2 border-primary/60 bg-background text-primary">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <SelectValue placeholder="Add an extra service" />
          </div>
        </SelectTrigger>
        <SelectContent className="border-border bg-popover">
          {services.map((service) => (
            <SelectItem
              key={service.service_id}
              value={service.service_id.toString()}
              disabled={extraServiceIds.includes(service.service_id.toString())}
              className="text-foreground focus:bg-muted"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span>{service.name}</span>
                <span className="text-sm text-muted-foreground">
                  {service.price > 0
                    ? `(£${service.price.toFixed(2)})`
                    : service.price < 0
                      ? `(-£${Math.abs(service.price).toFixed(2)})`
                      : "(Free)"}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExtraServicesSection;
