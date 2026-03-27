import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, PencilLine, Phone, Plus, Trash2, UserRound } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomersPaginated,
  updateCustomer,
  type CreateCustomerData,
  type UpdateCustomerData,
} from "@/api/customerRequests";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchReset } from "@/hooks/useSearchReset";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { Customer } from "@/types/interfaces";
import CustomerEditPanel, { type CustomerFormState } from "@/components/customers/CustomerEditPanel";
import ManagementCard from "@/components/admin/ManagementCard";
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
import { usePagination } from "@/hooks/usePagination";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import { DEFAULT_PAGINATION, type PaginationInfo as PaginationInfoType } from "@/types/interfaces";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const Customers = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("edit");
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const { extractPaginationFromResponse } = usePagination();
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers", currentPage, pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const { data, response } = await fetchCustomersPaginated({
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
      });
      const pagination = extractPaginationFromResponse(response);
      setPaginationInfo(pagination);
      return data;
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize]);

  useEffect(() => {
    if (currentPage > paginationInfo.total_pages && paginationInfo.total_pages > 0) {
      setCurrentPage(paginationInfo.total_pages);
    }
  }, [currentPage, paginationInfo.total_pages]);

  const createCustomerMutation = useMutation({
    mutationFn: (payload: CreateCustomerData) => createCustomer(payload),
    onSuccess: (newCustomer) => {
      toast.success(`Created ${newCustomer.name}`);
      setIsEditOpen(false);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ customerId, payload }: { customerId: number; payload: UpdateCustomerData }) =>
      updateCustomer(customerId, payload),
    onSuccess: (updatedCustomer) => {
      toast.success(`Updated ${updatedCustomer.name}`);
      setIsEditOpen(false);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: number) => deleteCustomer(customerId),
    onSuccess: (_, deletedId) => {
      toast.success("Customer deleted");
      setCustomerToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete customer: ${(mutationError as Error).message}`);
    },
  });

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedCustomer(null);
    setIsEditOpen(true);
  };

  const openEditPanel = (customer: Customer) => {
    setPanelMode("edit");
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleSaveCustomer = async (formData: CustomerFormState) => {
    if (panelMode === "create") {
      const createPayload: CreateCustomerData = {
        ...formData,
        signed_up_on: new Date().toISOString(),
      };
      await createCustomerMutation.mutateAsync(createPayload);
      return;
    }

    if (!selectedCustomer) {
      return;
    }

    const updatePayload: UpdateCustomerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      is_active: formData.is_active,
    };

    await updateCustomerMutation.mutateAsync({
      customerId: selectedCustomer.customer_id,
      payload: updatePayload,
    });
  };

  const customers = data ?? [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageSizeOptions = [12, 24, 48].filter((size) => {
    return paginationInfo.total_items === 0 || size <= Math.max(48, paginationInfo.total_items);
  });

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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Customers</h1>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Input
              placeholder="Search customers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-10 rounded-md border border-border bg-background px-3 text-foreground"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            {isAdmin && (
              <Button onClick={openCreatePanel} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add Customer
              </Button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            Error loading customers: {(error as Error).message}
          </div>
        )}

        {!isLoading && !isError && customers.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No customers found. {isAdmin ? "Add one to get started." : ""}
          </div>
        )}

        {!isLoading && !isError && customers.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => {
              const signedUp = format(new Date(customer.signed_up_on), "MMM d, yyyy");

              return (
                <ManagementCard
                  key={customer.customer_id}
                  title={customer.name}
                  badges={
                    <Badge variant={customer.is_active ? "secondary" : "outline"}>
                      {customer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  }
                  actions={
                    isAdmin ? (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditPanel(customer)}
                          aria-label={`Edit ${customer.name}`}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setCustomerToDelete(customer)}
                          aria-label={`Delete ${customer.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null
                  }
                  footer={
                    <div className="text-sm text-foreground/80">
                      <p className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>Signed up {signedUp}</span>
                      </p>
                    </div>
                  }
                >
                  <div className="space-y-2 text-sm text-foreground/80">
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}
                        className="break-words transition hover:text-primary"
                      >
                        {customer.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={`mailto:${customer.email}`}
                        className="break-all transition hover:text-primary"
                      >
                        {customer.email}
                      </a>
                    </div>
                    {(customer.emergency_contact_name || customer.emergency_contact_phone) && (
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Emergency Contact
                        </p>
                        <div className="space-y-2">
                          {customer.emergency_contact_name ? (
                            <div className="flex items-start gap-2">
                              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="break-words">{customer.emergency_contact_name}</span>
                            </div>
                          ) : null}
                          {customer.emergency_contact_phone ? (
                            <div className="flex items-start gap-2">
                              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <a
                                href={`tel:${customer.emergency_contact_phone.replace(/[^\d+]/g, "")}`}
                                className="break-words transition hover:text-primary"
                              >
                                {customer.emergency_contact_phone}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </ManagementCard>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
              itemName="customers"
            />
          </div>
        )}
      </main>

      <CustomerEditPanel
        open={isEditOpen}
        customer={selectedCustomer}
        mode={panelMode}
        isSaving={createCustomerMutation.isPending || updateCustomerMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedCustomer(null);
            setPanelMode("edit");
          }
        }}
        onSave={handleSaveCustomer}
      />

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {customerToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCustomerMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCustomerMutation.isPending || !customerToDelete}
              onClick={async () => {
                if (!customerToDelete) {
                  return;
                }
                await deleteCustomerMutation.mutateAsync(customerToDelete.customer_id);
              }}
            >
              {deleteCustomerMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
