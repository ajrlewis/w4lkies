import { useRef, useState } from "react";
import { toast } from "@/components/ui/sonner";
import BookingFilters from "./BookingFilters";
import PaginationInfo from "./PaginationInfo";
import BookingsList from "./BookingsList";
import BookingEditModal from "./BookingEditModal";
import { useBookingsData } from "./hooks/useBookingsData";
import { EnhancedBooking } from "@/types/interfaces";

const FutureBookings = () => {
  const bookingsRef = useRef<HTMLDivElement>(null);
  const [editingBooking, setEditingBooking] = useState<EnhancedBooking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    refetchBookings,
  } = useBookingsData();

  const handlePageChangeWithScroll = (page: number) => {
    handlePageChange(page);
    if (bookingsRef.current) {
      bookingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleEdit = (bookingId: string) => {
    const bookingToEdit = groupedBookings.flatMap((group) => group.bookings).find((booking) => booking.id === bookingId);

    if (bookingToEdit) {
      setEditingBooking(bookingToEdit);
      setIsEditModalOpen(true);
    } else {
      toast.error("Booking not found");
    }
  };

  const handleEditSave = () => {
    refetchBookings();
  };

  if (loading && loadingFilters) {
    return <div className="py-8 text-center text-foreground">Loading bookings...</div>;
  }

  return (
    <div ref={bookingsRef}>
      <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">Upcoming Bookings</h2>

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

      <BookingsList
        groupedBookings={groupedBookings}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetFilters={resetFilters}
        loading={loading}
      />

      <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChangeWithScroll} />

      <BookingEditModal
        booking={editingBooking}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default FutureBookings;
