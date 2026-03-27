
import { format, parseISO } from "date-fns";
import { Clock, User } from "lucide-react";
import { EnhancedBooking } from "@/types/interfaces";

interface BookingHistoryItemProps {
  booking: EnhancedBooking;
}

const BookingHistoryItem = ({ booking }: BookingHistoryItemProps) => {
  return (
    <li className="p-4 flex flex-col sm:flex-row gap-2 justify-between transition-colors" style={{ backgroundColor: 'var(--bg-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="h-4 w-4" />
            <span>
              {format(
                booking.date.includes('T') 
                  ? parseISO(booking.date) 
                  : new Date(booking.date),
                "MMM d, yyyy"
              )} at {booking.time.includes(':') ? booking.time : `${booking.time}:00`}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <User className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {booking.customer_name}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-start sm:items-end">
        <span style={{ color: 'var(--text-primary)' }}>
          {booking.service_name}
        </span>
        {booking.extra_services && booking.extra_services.length > 0 && (
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            + {booking.extra_services.join(", ")}
          </span>
        )}
        {booking.price !== undefined && (
          <span className="font-medium mt-1" style={{ color: 'var(--primary)' }}>
            £{booking.price.toFixed(2)}
          </span>
        )}
      </div>
    </li>
  );
};

export default BookingHistoryItem;
