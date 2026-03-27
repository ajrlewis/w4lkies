
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { EnhancedBooking } from "@/types/interfaces";
import { apiRequest } from "@/api/apiService";

interface BookingEditModalProps {
  booking: EnhancedBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BookingEditModal = ({ booking, isOpen, onClose, onSave }: BookingEditModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setDate(booking.date);
      setTime(booking.time);
    }
  }, [booking]);

  const handleSave = async () => {
    if (!booking) return;

    setLoading(true);
    try {
      // Get all booking IDs that need to be updated
      const bookingIds = booking.booking_ids || [booking.booking_id!];
      
      // Update all bookings with the new date and time
      const updatePromises = bookingIds.map(id => 
        apiRequest(`/bookings/${id}`, "PUT", {
          date,
          time
        })
      );
      
      await Promise.all(updatePromises);
      
      toast.success(
        bookingIds.length > 1 
          ? `Updated ${bookingIds.length} bookings successfully`
          : "Booking updated successfully"
      );
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const bookingCount = booking.booking_ids?.length || 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            Edit Booking{bookingCount > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-secondary)' }}>
            {bookingCount > 1 
              ? `This will update ${bookingCount} bookings for ${booking.customer_name} with ${booking.user_name}`
              : `Update booking for ${booking.customer_name} with ${booking.user_name}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-md border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-primary)' }}
          >
            {loading ? 'Saving...' : `Save ${bookingCount > 1 ? 'Bookings' : 'Booking'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingEditModal;
