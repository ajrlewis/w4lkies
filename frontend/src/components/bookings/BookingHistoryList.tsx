
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedBooking } from "@/types/interfaces";
import BookingHistoryCard from "./BookingHistoryCard";

interface BookingHistoryListProps {
  bookings: EnhancedBooking[];
  onEdit: (bookingId: string) => void;
  onDelete: (bookingId: string) => void;
}

const BookingHistoryList = ({ bookings, onEdit, onDelete }: BookingHistoryListProps) => {
  return (
    <Card className="mb-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <CardContent className="p-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-primary)' }}>
            <p>No past bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingHistoryCard 
                key={booking.id} 
                booking={booking}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingHistoryList;
