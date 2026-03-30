import { Banknote, Clock3, PencilLine, Trash2, UserRound } from "lucide-react";

import type { EnhancedBooking } from "@/types/interfaces";
import ManagementCard from "@/components/admin/ManagementCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookingManagementCardProps {
  booking: EnhancedBooking;
  isAdmin: boolean;
  onEdit: (booking: EnhancedBooking) => void;
  onRequestDelete: (booking: EnhancedBooking) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const BookingManagementCard = ({
  booking,
  isAdmin,
  onEdit,
  onRequestDelete,
}: BookingManagementCardProps) => {
  const dogNamesLabel =
    booking.dog_names && booking.dog_names.length > 0
      ? booking.dog_names.join(", ")
      : booking.customer_name;
  const vetSummary =
    booking.vet_names && booking.vet_names.length > 0
      ? booking.vet_names.length === 1
        ? `Vet: ${booking.vet_names[0]}`
        : `Vets: ${booking.vet_names.length}`
      : null;
  const metaParts = [
    ...(booking.dog_names && booking.dog_names.length > 0 ? [`Customer: ${booking.customer_name}`] : []),
    ...(vetSummary ? [vetSummary] : []),
  ];

  return (
    <ManagementCard
      title={`${booking.time} · ${dogNamesLabel}`}
      subtitle={
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          Walker: {booking.user_name}
        </span>
      }
      badges={<Badge variant="outline">Booking</Badge>}
      actions={
        isAdmin ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(booking)}
              aria-label={`Edit booking ${booking.booking_id ?? booking.id}`}
            >
              <PencilLine className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRequestDelete(booking)}
              aria-label={`Delete booking ${booking.booking_id ?? booking.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      }
      footer={
        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/80">
          <p className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{booking.time}</span>
          </p>
          <p className="inline-flex items-center gap-2">
            <Banknote className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{currencyFormatter.format(booking.price || 0)}</span>
          </p>
        </div>
      }
    >
      {metaParts.length > 0 ? (
        <p className="mb-1 text-xs text-muted-foreground">{metaParts.join(" · ")}</p>
      ) : null}
      <p className="text-sm text-foreground/80">
        {booking.service_name}
        {booking.extra_services && booking.extra_services.length > 0
          ? ` + ${booking.extra_services.join(", ")}`
          : ""}
      </p>
    </ManagementCard>
  );
};

export default BookingManagementCard;
