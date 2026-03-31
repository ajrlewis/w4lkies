import { useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
} from "lucide-react";

import { Invoice } from "@/types/interfaces";
import ManagementCard from "@/components/admin/ManagementCard";
import { Button } from "@/components/ui/button";
import { downloadInvoice } from "@/api/invoiceRequests";
import { toast } from "@/components/ui/sonner";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete?: (invoiceId: number) => void;
  isAdmin?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "N/A";
  }
  return new Date(dateString).toLocaleDateString();
};

const InvoiceCard = ({ invoice, onDelete, isAdmin }: InvoiceCardProps) => {
  const [showBookings, setShowBookings] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isPaid = invoice.date_paid !== null;
  const bookingCount = invoice.bookings?.length || 0;
  const customerName = invoice.customer?.name || "Unknown Customer";

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoice(invoice.invoice_id);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return false;
    }
    setIsDeleting(true);
    try {
      await onDelete(invoice.invoice_id);
      toast.success("Invoice deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete invoice");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ManagementCard
      title={invoice.reference}
      subtitle={<span>{customerName}</span>}
      actions={
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
            disabled={isDownloading || isDeleting}
            aria-label={`Download ${invoice.reference}`}
          >
            {isDownloading ? <LoadingSpinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          </Button>
          {isAdmin && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting || isDownloading}
              aria-label={`Delete ${invoice.reference}`}
            >
              {isDeleting ? <LoadingSpinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          ) : null}
        </div>
      }
      footer={
        <p className="text-base font-semibold text-foreground">
          Total {currencyFormatter.format(invoice.price_total)}
        </p>
      }
    >
      <div className="space-y-1.5 text-sm text-foreground/80">
        <p>
          <span className="text-muted-foreground">Period:</span>{" "}
          {formatDate(invoice.date_start)} - {formatDate(invoice.date_end)}
        </p>
        <p>
          <span className="text-muted-foreground">
            Issued {formatDate(invoice.date_issued)} · Due {formatDate(invoice.date_due)}
          </span>
        </p>
        {isPaid ? (
          <p>
            <span className="text-muted-foreground">Paid:</span> {formatDate(invoice.date_paid)}
          </p>
        ) : null}

        {bookingCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setShowBookings((prev) => !prev)}
          >
            <CalendarClock className="mr-1 h-3.5 w-3.5" />
            {bookingCount} booking{bookingCount === 1 ? "" : "s"}
            {showBookings ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            )}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">No bookings</p>
        )}

        {showBookings && bookingCount > 0 ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="space-y-1 text-xs text-foreground/80">
              {invoice.bookings?.map((booking, index) => (
                <p key={`${invoice.invoice_id}-${index}`}>
                  {formatDate(booking.date)} at {booking.time} · {booking.service?.name || "Service"} ·{" "}
                  {currencyFormatter.format(booking.service?.price || 0)}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {invoice.reference}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (event) => {
                event.preventDefault();
                const deleted = await handleDelete();
                if (deleted) {
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementCard>
  );
};

export default InvoiceCard;
