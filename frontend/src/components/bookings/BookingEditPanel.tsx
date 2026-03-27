import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock3 } from "lucide-react";
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

interface BookingEditPanelProps {
  open: boolean;
  booking: EnhancedBooking | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: { date: string; time: string; user_id: number; customer_id: number }) => Promise<void>;
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
  const { data: users = [] } = useActiveUsers();
  const { data: customers = [] } = useActiveCustomers();
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
  }, [booking, open]);

  const bookingCount = booking?.booking_ids?.length || 1;
  const isFormValid = useMemo(() => {
    return date.length > 0 && time.length > 0 && userId.length > 0 && customerId.length > 0;
  }, [date, time, userId, customerId]);

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
          })
        }
        disabled={isSaving || !isFormValid}
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
