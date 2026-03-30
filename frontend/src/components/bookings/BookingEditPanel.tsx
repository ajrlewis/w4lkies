import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock3, RotateCcw, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { EnhancedBooking } from "@/types/interfaces";
import { fetchBookingTimes } from "@/api/bookingRequests";
import { useActiveCustomers } from "@/hooks/useActiveCustomers";
import { useActiveUsers } from "@/hooks/useActiveUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useActiveServices } from "@/hooks/useActiveServices";
import ExtraServicesSection from "@/components/bookings/ExtraServicesSection";

interface BookingEditPanelProps {
  open: boolean;
  booking: EnhancedBooking | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    date: string;
    time: string;
    user_id: number;
    customer_id: number;
    additional_service_ids: number[];
    remove_booking_ids: number[];
  }) => Promise<void>;
}

const BookingEditPanel = ({
  open,
  booking,
  isSaving,
  onOpenChange,
  onSave,
}: BookingEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userId, setUserId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [extraServiceIds, setExtraServiceIds] = useState<string[]>([]);
  const [removedBookingIds, setRemovedBookingIds] = useState<number[]>([]);
  const { data: users = [] } = useActiveUsers();
  const { data: customers = [] } = useActiveCustomers();
  const { data: services = [] } = useActiveServices();
  const { data: timeSlots = [] } = useQuery({
    queryKey: ["booking-time-slots"],
    queryFn: fetchBookingTimes,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!booking) {
      return;
    }
    setDate(booking.date);
    setTime(booking.time_value || `${booking.time}:00`);
    setUserId(booking.user_id ? String(booking.user_id) : "");
    setCustomerId(booking.customer_id ? String(booking.customer_id) : "");
    setExtraServiceIds([]);
    setRemovedBookingIds([]);
  }, [booking, open]);

  const currentServices = useMemo(
    () => {
      if (!booking) {
        return [] as { name: string; bookingId?: number }[];
      }
      const serviceNames = [booking.service_name, ...(booking.extra_services || [])];
      const bookingIds =
        booking.booking_ids && booking.booking_ids.length > 0
          ? booking.booking_ids
          : typeof booking.booking_id === "number"
            ? [booking.booking_id]
            : [];
      return serviceNames.map((name, index) => ({ name, bookingId: bookingIds[index] }));
    },
    [booking]
  );
  const activeCurrentServiceCount = useMemo(
    () =>
      currentServices.filter(
        (service) =>
          typeof service.bookingId !== "number" || !removedBookingIds.includes(service.bookingId)
      ).length,
    [currentServices, removedBookingIds]
  );
  const bookingCount = currentServices.length || 1;
  const isFormValid = useMemo(() => {
    return date.length > 0 && time.length > 0 && userId.length > 0 && customerId.length > 0;
  }, [date, time, userId, customerId]);
  const activeServiceNames = useMemo(() => {
    const names = new Set<string>();
    currentServices.forEach((service) => {
      const isRemoved =
        typeof service.bookingId === "number" && removedBookingIds.includes(service.bookingId);
      if (!isRemoved) {
        names.add(service.name.trim().toLowerCase());
      }
    });
    return names;
  }, [currentServices, removedBookingIds]);
  const availableExtraServices = useMemo(
    () =>
      services.filter(
        (service) => !activeServiceNames.has(service.name.trim().toLowerCase())
      ),
    [services, activeServiceNames]
  );
  const canSaveServiceSelection = activeCurrentServiceCount + extraServiceIds.length > 0;

  if (!booking) {
    return null;
  }

  const formBody = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="booking-date" className="text-xs uppercase tracking-wide text-muted-foreground">
          Date
        </Label>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="booking-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-time" className="text-xs uppercase tracking-wide text-muted-foreground">
          Time
        </Label>
        <div className="relative">
          <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger id="booking-time" className="pl-10">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">User</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.user_id} value={user.user_id.toString()}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Customer</Label>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Services</p>
        <div className="space-y-2">
          {currentServices.map((service, index) => {
            const isRemoved =
              typeof service.bookingId === "number" && removedBookingIds.includes(service.bookingId);
            const canRemove =
              isRemoved || activeCurrentServiceCount - 1 + extraServiceIds.length >= 1;
            return (
              <div
                key={`${service.name}-${service.bookingId ?? index}`}
                className="flex items-center justify-between rounded-md border border-border/70 bg-muted/40 p-3"
              >
                <span
                  className={`text-sm ${isRemoved ? "text-muted-foreground line-through" : "text-foreground/90"}`}
                >
                  {service.name}
                </span>
                {typeof service.bookingId === "number" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={isRemoved ? "" : "text-destructive hover:text-destructive"}
                    onClick={() =>
                      setRemovedBookingIds((current) =>
                        isRemoved
                          ? current.filter((bookingId) => bookingId !== service.bookingId)
                          : [...current, service.bookingId]
                      )
                    }
                    disabled={!canRemove}
                  >
                    {isRemoved ? (
                      <>
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Keep
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Keep at least one service on the booking.
        </p>
      </div>

      {availableExtraServices.length > 0 ? (
        <ExtraServicesSection
          services={availableExtraServices}
          extraServiceIds={extraServiceIds}
          onAddExtraService={(serviceId) => {
            if (!extraServiceIds.includes(serviceId)) {
              setExtraServiceIds((current) => [...current, serviceId]);
            }
          }}
          onRemoveExtraService={(serviceId) =>
            setExtraServiceIds((current) => current.filter((id) => id !== serviceId))
          }
        />
      ) : (
        <p className="text-sm text-muted-foreground">No additional services available to add.</p>
      )}
    </div>
  );

  const actions = (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        type="button"
        onClick={() =>
          onSave({
            date,
            time,
            user_id: Number(userId),
            customer_id: Number(customerId),
            additional_service_ids: extraServiceIds.map((serviceId) => Number(serviceId)),
            remove_booking_ids: removedBookingIds,
          })
        }
        disabled={isSaving || !isFormValid || !canSaveServiceSelection}
      >
        {isSaving ? "Saving..." : bookingCount > 1 ? `Save ${bookingCount} Bookings` : "Save Booking"}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>Edit Booking{bookingCount > 1 ? "s" : ""}</SheetTitle>
            <SheetDescription>
              {bookingCount > 1
                ? `Update ${bookingCount} grouped bookings for ${booking.customer_name}.`
                : `Update booking for ${booking.customer_name}.`}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 pb-6">{formBody}</div>
          {actions}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Booking{bookingCount > 1 ? "s" : ""}</DrawerTitle>
          <DrawerDescription>
            {bookingCount > 1
              ? `Update ${bookingCount} grouped bookings for ${booking.customer_name}.`
              : `Update booking for ${booking.customer_name}.`}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BookingEditPanel;
