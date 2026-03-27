import { useEffect, useState } from "react";

import InvoiceGenerateForm from "@/components/invoices/InvoiceGenerateForm";
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

interface InvoiceGeneratePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: () => void;
}

const InvoiceGeneratePanel = ({ open, onOpenChange, onGenerated }: InvoiceGeneratePanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const handleSuccess = () => {
    onGenerated();
    onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>Add Invoice</SheetTitle>
            <SheetDescription>
              Generate an invoice from customer bookings across a selected date range.
            </SheetDescription>
          </SheetHeader>
          <div className="pb-6">
            <InvoiceGenerateForm onCancel={() => onOpenChange(false)} onSuccess={handleSuccess} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Invoice</DrawerTitle>
          <DrawerDescription>
            Generate an invoice from customer bookings across a selected date range.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <InvoiceGenerateForm onCancel={() => onOpenChange(false)} onSuccess={handleSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default InvoiceGeneratePanel;
