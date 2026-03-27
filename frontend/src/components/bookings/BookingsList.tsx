import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GroupedBooking } from "@/types/interfaces";
import BookingCard from "./BookingCard";

interface BookingsListProps {
  groupedBookings: GroupedBooking[];
  onEdit: (bookingId: string) => void;
  onDelete: (bookingId: string) => void;
  onResetFilters: () => void;
  loading: boolean;
}

const BookingsList = ({ groupedBookings, onEdit, onDelete, onResetFilters, loading }: BookingsListProps) => {
  if (groupedBookings.length === 0 && !loading) {
    return (
      <div className="rounded-lg border border-border/70 bg-card p-6 text-center shadow-sm sm:p-8">
        <p className="text-muted-foreground">No bookings match your filters.</p>
        <Button variant="link" onClick={onResetFilters} className="mt-2 text-primary">
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {groupedBookings.map((group) => (
        <Card key={group.date} className="border-border/70 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between gap-4 text-lg font-semibold text-foreground sm:text-xl">
              <span>{group.formattedDate}</span>
              <span className="text-base font-semibold text-primary sm:text-lg">{group.totalPrice}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingsList;
