import { useRef } from "react";
import { History } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import BookingFilters from "./BookingFilters";
import PaginationInfo from "./PaginationInfo";
import BookingHistoryList from "./BookingHistoryList";
import { useBookingHistoryData } from "./hooks/useBookingHistoryData";
import { Card, CardContent } from "@/components/ui/card";

const BookingHistory = () => {
  const bookingsRef = useRef<HTMLDivElement>(null);

  const {
    groupedBookings,
    loading,
    paginationInfo,
    userFilter,
    customerFilter,
    users,
    customers,
    loadingFilters,
    setUserFilter,
    setCustomerFilter,
    handleDelete,
    resetFilters,
    handlePageChange,
  } = useBookingHistoryData();

  const handlePageChangeWithScroll = (page: number) => {
    handlePageChange(page);
    if (bookingsRef.current) {
      bookingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleEdit = (bookingId: string) => {
    toast.info(`Editing booking ${bookingId}`);
  };

  if (loading && loadingFilters) {
    return <div className="py-8 text-center text-foreground">Loading booking history...</div>;
  }

  return (
    <div ref={bookingsRef}>
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Booking History</h2>
      </div>

      <BookingFilters
        userFilter={userFilter}
        customerFilter={customerFilter}
        users={users}
        customers={customers}
        onUserFilterChange={setUserFilter}
        onCustomerFilterChange={setCustomerFilter}
        onResetFilters={resetFilters}
        loadingFilters={loadingFilters}
      />

      {loading ? (
        <div className="py-8 text-center text-foreground">Loading bookings...</div>
      ) : groupedBookings.length === 0 ? (
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-8 text-center">
            <p className="text-foreground">No booking history found.</p>
            <button onClick={resetFilters} className="mt-2 text-primary hover:underline">
              Clear filters to see all bookings
            </button>
          </CardContent>
        </Card>
      ) : (
        groupedBookings.map((group) => (
          <div key={group.date} className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-medium text-foreground sm:text-lg">{group.formattedDate}</h3>
              <span className="text-base font-semibold text-primary sm:text-lg">{group.totalPrice}</span>
            </div>
            <BookingHistoryList bookings={group.bookings} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        ))
      )}

      <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChangeWithScroll} />
    </div>
  );
};

export default BookingHistory;
