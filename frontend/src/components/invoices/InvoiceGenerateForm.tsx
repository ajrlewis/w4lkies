
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateInvoice } from "@/api/invoiceRequests";
import { fetchActiveCustomers } from "@/api/customerRequests";
import { toast } from "@/components/ui/sonner";

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

    if (new Date(dateStart) >= new Date(dateEnd)) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsGenerating(true);
    try {
      if (selectedCustomerId === "all") {
        // Generate invoices for all customers
        const activeCustomers = customers?.filter(customer => customer.is_active) || [];
        const results = await Promise.allSettled(
          activeCustomers.map(customer => 
            generateInvoice(customer.customer_id, dateStart, dateEnd)
          )
        );
        
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;
        
        if (successful > 0) {
          toast.success(`Generated ${successful} invoice(s) successfully${failed > 0 ? ` (${failed} failed)` : ''}`);
        } else {
          toast.error("Failed to generate any invoices");
        }
      } else {
        await generateInvoice(parseInt(selectedCustomerId), dateStart, dateEnd);
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
        <Label htmlFor="customer" style={{ color: 'var(--text-primary)' }}>Customer *</Label>
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
            <SelectItem value="all" className="hover:bg-[var(--bg-muted)] transition-colors" style={{ color: 'var(--text-primary)' }}>All Active Customers</SelectItem>
            {customersLoading ? (
              <SelectItem value="loading" disabled className="hover:bg-[var(--bg-muted)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Loading customers...</SelectItem>
            ) : (
              customers?.filter(customer => customer.is_active).map((customer) => (
                <SelectItem key={customer.customer_id} value={customer.customer_id.toString()} className="hover:bg-[var(--bg-muted)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {customer.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateStart" style={{ color: 'var(--text-primary)' }}>From Date *</Label>
          <Input
            id="dateStart"
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            required
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)',
              colorScheme: 'dark light'
            }}
            className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateEnd" style={{ color: 'var(--text-primary)' }}>To Date *</Label>
          <Input
            id="dateEnd"
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            required
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)',
              colorScheme: 'dark light'
            }}
            className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
          className="hover:bg-[var(--bg-muted)] transition-colors"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isGenerating}
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-primary)' }}
          className="hover:opacity-90 transition-opacity"
        >
          {isGenerating ? "Generating..." : selectedCustomerId === "all" ? "Generate All Invoices" : "Generate Invoice"}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceGenerateForm;
