
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EnhancedBooking } from "@/types/interfaces";

interface BookingHistoryCardProps {
  booking: EnhancedBooking;
  onEdit: (bookingId: string) => void;
  onDelete: (bookingId: string) => void;
}

const BookingHistoryCard = ({ booking, onEdit, onDelete }: BookingHistoryCardProps) => {
  const handleDelete = () => {
    // Use the actual booking_id instead of the composite id
    const bookingIdToDelete = booking.booking_id?.toString() || booking.id;
    console.log("BookingHistoryCard delete - using booking_id:", bookingIdToDelete);
    onDelete(bookingIdToDelete);
  };

  // Get the booking IDs for display in the confirmation dialog
  const bookingIds = booking.booking_ids || [booking.booking_id];
  const bookingIdsText = bookingIds.filter(id => id !== undefined).join(", ");

  return (
    <div 
      key={booking.id}
      className="p-3 rounded-md flex flex-wrap items-center justify-between gap-2"
      style={{ backgroundColor: 'var(--bg-muted)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold" style={{ color: 'var(--primary)' }}>
            {booking.time}
          </span>
          <span style={{ color: 'var(--text-primary)' }}>
            <span className="font-medium">{booking.user_name}</span> with {booking.customer_name}
          </span>
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {booking.service_name}
          {booking.extra_services && booking.extra_services.length > 0 && (
            <span className="italic"> + {booking.extra_services.join(", ")}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
              style={{ borderColor: 'var(--border)' }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
                This action cannot be undone. This will permanently delete booking(s) {bookingIdsText} from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default BookingHistoryCard;
