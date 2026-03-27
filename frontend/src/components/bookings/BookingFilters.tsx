import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Customer } from "@/types/interfaces";

interface BookingFiltersProps {
  userFilter: string;
  customerFilter: string;
  users: User[];
  customers: Customer[];
  onUserFilterChange: (value: string) => void;
  onCustomerFilterChange: (value: string) => void;
  onResetFilters: () => void;
  loadingFilters: boolean;
}

const BookingFilters = ({
  userFilter,
  customerFilter,
  users,
  customers,
  onUserFilterChange,
  onCustomerFilterChange,
  onResetFilters,
  loadingFilters,
}: BookingFiltersProps) => {
  return (
    <Card className="mb-4 border-border/70 bg-card/80 sm:mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
          <Filter className="h-5 w-5" />
          Filter Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <Select value={userFilter} onValueChange={onUserFilterChange} disabled={loadingFilters}>
              <SelectTrigger className="w-full border-border bg-background text-foreground">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all" className="text-foreground focus:bg-muted">
                  All Users
                </SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id.toString()} className="text-foreground focus:bg-muted">
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={customerFilter} onValueChange={onCustomerFilterChange} disabled={loadingFilters}>
              <SelectTrigger className="w-full border-border bg-background text-foreground">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all" className="text-foreground focus:bg-muted">
                  All Customers
                </SelectItem>
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.customer_id}
                    value={customer.customer_id.toString()}
                    className="text-foreground focus:bg-muted"
                  >
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onResetFilters} className="border-border text-foreground" disabled={loadingFilters}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFilters;
