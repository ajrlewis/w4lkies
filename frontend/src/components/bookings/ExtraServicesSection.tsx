import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service } from "@/types/interfaces";

interface ExtraServicesSectionProps {
  services: Service[];
  extraServices: { id: string; serviceId: string }[];
  onAddExtraService: () => void;
  onUpdateExtraService: (id: string, serviceId: string) => void;
  onRemoveExtraService: (id: string) => void;
}

const ExtraServicesSection = ({
  services,
  extraServices,
  onAddExtraService,
  onUpdateExtraService,
  onRemoveExtraService,
}: ExtraServicesSectionProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Extra Services (Optional)
      </Label>

      {extraServices.length > 0 && (
        <div className="space-y-2">
          {extraServices.map((extraService) => (
            <div
              key={extraService.id}
              className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/40 p-3"
            >
              <Select
                value={extraService.serviceId}
                onValueChange={(serviceId) => onUpdateExtraService(extraService.id, serviceId)}
              >
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Select an extra service" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {services.map((service) => (
                    <SelectItem key={service.service_id} value={service.service_id.toString()}>
                      {service.name}{" "}
                      {service.price > 0
                        ? `(£${service.price.toFixed(2)})`
                        : service.price < 0
                          ? `(-£${Math.abs(service.price).toFixed(2)})`
                          : "(Free)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                onClick={() => onRemoveExtraService(extraService.id)}
                aria-label="Remove extra service"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" className="h-11 w-full" onClick={onAddExtraService}>
        <Plus className="mr-2 h-4 w-4" />
        Add an extra service
      </Button>
    </div>
  );
};

export default ExtraServicesSection;
