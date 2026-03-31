
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateInvoice, generateInvoicesForAllCustomers } from "@/api/invoiceRequests";
import { fetchActiveCustomers } from "@/api/customerRequests";
import { toast } from "@/components/ui/sonner";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface InvoiceGenerateFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const InvoiceGenerateForm = ({ onCancel, onSuccess }: InvoiceGenerateFormProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchActiveCustomers
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId || !dateStart || !dateEnd) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(dateStart) > new Date(dateEnd)) {
      toast.error("Start date must be before or equal to end date");
      return;
    }

    setIsGenerating(true);
    try {
      if (selectedCustomerId === "all") {
        const result = await generateInvoicesForAllCustomers(dateStart, dateEnd);
        if (result.invoices_generated > 0) {
          toast.success(
            `Generated ${result.invoices_generated} invoice(s) for ${result.customers_with_bookings} customer(s)${
              result.skipped_customers > 0
                ? ` (${result.skipped_customers} already invoiced)`
                : ""
            }.`
          );
        } else if (result.customers_with_bookings > 0) {
          toast.info("All bookings in the selected range are already linked to invoices.");
        } else {
          toast.info("No bookings found for the selected date range.");
        }
      } else {
        await generateInvoice(parseInt(selectedCustomerId, 10), dateStart, dateEnd);
        toast.success("Invoice generated successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to generate invoice(s)");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer" className="text-foreground">
          Customer *
        </Label>
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger className="border-border bg-background text-foreground">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all" className="text-foreground focus:bg-muted">
              All Customers With Bookings In Range
            </SelectItem>
            {customersLoading ? (
              <SelectItem value="loading" disabled className="text-muted-foreground">
                Loading customers...
              </SelectItem>
            ) : (
              customers?.filter((customer) => customer.is_active).map((customer) => (
                <SelectItem
                  key={customer.customer_id}
                  value={customer.customer_id.toString()}
                  className="text-foreground focus:bg-muted"
                >
                  {customer.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateStart" className="text-foreground">
            From Date *
          </Label>
          <Input
            id="dateStart"
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            required
            className="border-border bg-background text-foreground [color-scheme:dark_light] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateEnd" className="text-foreground">
            To Date *
          </Label>
          <Input
            id="dateEnd"
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            required
            className="border-border bg-background text-foreground [color-scheme:dark_light] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              {selectedCustomerId === "all" ? "Generating All..." : "Generating..."}
            </>
          ) : selectedCustomerId === "all" ? (
            "Generate All Invoices"
          ) : (
            "Generate Invoice"
          )}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceGenerateForm;
