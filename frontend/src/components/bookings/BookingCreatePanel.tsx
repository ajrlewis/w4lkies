import { useEffect, useState } from "react";

import BookingForm from "@/components/bookings/BookingForm";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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

interface BookingCreatePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const BookingCreatePanel = ({ open, onOpenChange, onCreated }: BookingCreatePanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const handleSubmitted = () => {
    onCreated();
    onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>Add Booking</SheetTitle>
            <SheetDescription>
              Create one or multiple bookings with extra services and additional dates.
            </SheetDescription>
          </SheetHeader>
          <div className="pb-6">
            <BookingForm onSubmitted={handleSubmitted} submitLabel="Create Booking" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Booking</DrawerTitle>
          <DrawerDescription>
            Create one or multiple bookings with extra services and additional dates.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <BookingForm onSubmitted={handleSubmitted} submitLabel="Create Booking" />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BookingCreatePanel;
