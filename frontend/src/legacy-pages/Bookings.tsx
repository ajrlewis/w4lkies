import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import PaginationInfo from "@/components/pagination/PaginationInfo";
import BookingCreatePanel from "@/components/bookings/BookingCreatePanel";
import BookingEditPanel from "@/components/bookings/BookingEditPanel";
import BookingManagementCard from "@/components/bookings/BookingManagementCard";
import {
  deleteBooking,
  fetchBookingFilterOptions,
  fetchBookingHistoryPaginated,
  fetchUpcomingBookingsPaginated,
  updateBooking,
  type BookingFilterCustomer,
  type BookingFilterUser,
} from "@/api/bookingRequests";
import { usePagination } from "@/hooks/usePagination";
import {
  DEFAULT_PAGINATION,
  type EnhancedBooking,
  type GroupedBooking,
  type PaginationInfo as PaginationInfoType,
} from "@/types/interfaces";
import { groupBookingsByDate, mapBookingToEnhanced } from "@/components/bookings/utils/bookingTransformations";
import { useSearchReset } from "@/hooks/useSearchReset";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type BookingViewMode = "upcoming" | "history";

const Bookings = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { extractPaginationFromResponse } = usePagination();

  const [viewMode, setViewMode] = useState<BookingViewMode>("upcoming");
  const [searchInput, setSearchInput] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 20,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<EnhancedBooking | null>(null);
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to access bookings");
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  const { data: filterOptions, isLoading: isLoadingFilterOptions } = useQuery<{
    users: BookingFilterUser[];
    customers: BookingFilterCustomer[];
  }>({
    queryKey: ["bookings-filter-options", viewMode],
    queryFn: () => fetchBookingFilterOptions(viewMode),
    enabled: isAuthenticated && isAdmin,
  });

  const users = filterOptions?.users ?? [];
  const customers = filterOptions?.customers ?? [];

  useEffect(() => {
    if (userFilter !== "all" && !users.some((user) => user.user_id.toString() === userFilter)) {
      setUserFilter("all");
    }
    if (
      customerFilter !== "all" &&
      !customers.some((customer) => customer.customer_id.toString() === customerFilter)
    ) {
      setCustomerFilter("all");
    }
  }, [users, customers, userFilter, customerFilter]);

  const {
    data: groupedBookings = [],
    isLoading,
    isError,
    error,
  } = useQuery<GroupedBooking[]>({
    queryKey: [
      "bookings-management",
      viewMode,
      currentPage,
      pageSize,
      debouncedSearchTerm,
      userFilter,
      customerFilter,
    ],
    enabled: isAuthenticated && isAdmin,
    queryFn: async () => {
      const bookingOptions = {
        page: currentPage,
        page_size: pageSize,
        user_id: userFilter === "all" ? undefined : Number(userFilter),
        customer_id: customerFilter === "all" ? undefined : Number(customerFilter),
        search: debouncedSearchTerm || undefined,
      };

      const { data, response } =
        viewMode === "upcoming"
          ? await fetchUpcomingBookingsPaginated(bookingOptions)
          : await fetchBookingHistoryPaginated(bookingOptions);

      const pagination = extractPaginationFromResponse(response);
      setPaginationInfo(pagination);

      const mapped = data.map(mapBookingToEnhanced);
      const grouped = groupBookingsByDate(mapped).sort((a, b) =>
        viewMode === "history" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
      );

      return grouped;
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, userFilter, customerFilter, pageSize, debouncedSearchTerm]);

  useEffect(() => {
    if (currentPage > paginationInfo.total_pages && paginationInfo.total_pages > 0) {
      setCurrentPage(paginationInfo.total_pages);
    }
  }, [currentPage, paginationInfo.total_pages]);

  const updateBookingMutation = useMutation({
    mutationFn: async ({
      bookingIds,
      payload,
    }: {
      bookingIds: number[];
      payload: { date: string; time: string; user_id: number; customer_id: number };
    }) => {
      await Promise.all(bookingIds.map((bookingId) => updateBooking(bookingId, payload)));
      return bookingIds.length;
    },
    onSuccess: (count) => {
      toast.success(count > 1 ? `Updated ${count} bookings` : "Booking updated");
      setIsEditOpen(false);
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ["bookings-management"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to update booking: ${(mutationError as Error).message}`);
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingIds: number[]) => {
      await Promise.all(bookingIds.map((bookingId) => deleteBooking(bookingId)));
      return bookingIds.length;
    },
    onSuccess: (count) => {
      toast.success(count > 1 ? `Deleted ${count} bookings` : "Booking deleted");
      setBookingToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["bookings-management"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete booking: ${(mutationError as Error).message}`);
    },
  });

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["bookings-management"] });
  };

  const handleEdit = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (payload: {
    date: string;
    time: string;
    user_id: number;
    customer_id: number;
  }) => {
    if (!selectedBooking) {
      return;
    }
    const bookingIds = (selectedBooking.booking_ids || [selectedBooking.booking_id]).filter(
      (id): id is number => typeof id === "number"
    );
    if (bookingIds.length === 0) {
      toast.error("No valid booking IDs found.");
      return;
    }
    await updateBookingMutation.mutateAsync({ bookingIds, payload });
  };

  const pageSizeOptions = [12, 24, 48].filter((size) => {
    return paginationInfo.total_items === 0 || size <= Math.max(48, paginationInfo.total_items);
  });
  const hasActiveFilters = userFilter !== "all" || customerFilter !== "all";
  const selectedUserLabel = users.find((user) => user.user_id.toString() === userFilter)?.username;
  const selectedCustomerLabel = customers.find((customer) => customer.customer_id.toString() === customerFilter)?.name;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-6">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center text-sm font-medium text-accent hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bookings</h1>
          </div>
        </div>

        {!isAdmin ? (
          <Card className="rounded-xl border border-border/70 bg-card p-5 text-center text-muted-foreground">
            You do not have permission to manage bookings.
          </Card>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex w-full items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-1 sm:w-auto">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value === "upcoming" || value === "history") {
                      setViewMode(value);
                    }
                  }}
                  className="w-full gap-0 sm:w-auto"
                >
                  <ToggleGroupItem
                    value="upcoming"
                    className="h-10 flex-1 min-w-[120px] rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground"
                  >
                    Upcoming
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="history"
                    className="h-10 flex-1 min-w-[120px] rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground"
                  >
                    History
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                <Input
                  placeholder="Search bookings..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full sm:w-64"
                />
                <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground sm:min-w-[170px]">
                  <span>Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-10 bg-transparent text-foreground outline-none"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <Button className="h-10 sm:w-auto" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Booking
                </Button>
              </div>
            </div>

            <Card className="mb-5 rounded-xl border-border/70 bg-card/80 p-4 sm:mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  Filters
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground"
                  onClick={() => {
                    setUserFilter("all");
                    setCustomerFilter("all");
                  }}
                  disabled={!hasActiveFilters}
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</p>
                  <Select value={userFilter} onValueChange={setUserFilter} disabled={isLoadingFilterOptions}>
                    <SelectTrigger className="w-full border-border bg-background text-foreground">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
                  <Select
                    value={customerFilter}
                    onValueChange={setCustomerFilter}
                    disabled={isLoadingFilterOptions}
                  >
                    <SelectTrigger className="w-full border-border bg-background text-foreground">
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {hasActiveFilters ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {userFilter !== "all" && selectedUserLabel ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full"
                      onClick={() => setUserFilter("all")}
                    >
                      User: {selectedUserLabel}
                      <X className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                  {customerFilter !== "all" && selectedCustomerLabel ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full"
                      onClick={() => setCustomerFilter("all")}
                    >
                      Customer: {selectedCustomerLabel}
                      <X className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </Card>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            )}

            {isError && (
              <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                Error loading bookings: {(error as Error).message}
              </div>
            )}

            {!isLoading && !isError && groupedBookings.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No {viewMode === "upcoming" ? "upcoming" : "historical"} bookings found.
              </div>
            )}

            {!isLoading && !isError && groupedBookings.length > 0 && (
              <div className="space-y-5 sm:space-y-6">
                {groupedBookings.map((group) => (
                  <Card key={group.date} className="rounded-xl border-border/70 bg-card/80 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold text-foreground sm:text-lg">{group.formattedDate}</h2>
                      <span className="text-sm font-semibold text-primary sm:text-base">{group.totalPrice}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {group.bookings.map((booking) => (
                        <BookingManagementCard
                          key={booking.id}
                          booking={booking}
                          isAdmin={isAdmin}
                          onEdit={handleEdit}
                          onRequestDelete={setBookingToDelete}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && !isError && paginationInfo.total_pages > 1 && (
              <div className="mt-8">
                <PaginationInfo
                  paginationInfo={paginationInfo}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  itemName="bookings"
                />
              </div>
            )}
          </>
        )}
      </main>

      <BookingCreatePanel
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />

      <BookingEditPanel
        open={isEditOpen}
        booking={selectedBooking}
        isSaving={updateBookingMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        onSave={handleSaveEdit}
      />

      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setBookingToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete{" "}
              {bookingToDelete?.booking_ids?.length || 1} booking
              {(bookingToDelete?.booking_ids?.length || 1) > 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBookingMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBookingMutation.isPending || !bookingToDelete}
              onClick={async () => {
                if (!bookingToDelete) {
                  return;
                }
                const bookingIds = (bookingToDelete.booking_ids || [bookingToDelete.booking_id]).filter(
                  (id): id is number => typeof id === "number"
                );
                if (bookingIds.length === 0) {
                  toast.error("No valid booking IDs found.");
                  return;
                }
                await deleteBookingMutation.mutateAsync(bookingIds);
              }}
            >
              {deleteBookingMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bookings;
