import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, PencilLine, Plus, Trash2 } from "lucide-react";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import {
  createService,
  deleteService,
  fetchServicesPaginated,
  updateService,
  type CreateServiceData,
} from "@/api/serviceRequests";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchReset } from "@/hooks/useSearchReset";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { Service } from "@/types/interfaces";
import ManagementCard from "@/components/admin/ManagementCard";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import ServiceEditPanel, { type ServiceFormState } from "@/components/services/ServiceEditPanel";
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
import LoadingSpinner from "@/components/ui/loading-spinner";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const Services = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("edit");
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const { extractPaginationFromResponse } = usePagination();
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["services", currentPage, pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const { data, response } = await fetchServicesPaginated({
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

  const createServiceMutation = useMutation({
    mutationFn: (payload: CreateServiceData) => createService(payload),
    onSuccess: (newService) => {
      toast.success(`Created ${newService.name}`);
      setIsEditOpen(false);
      setSelectedService(null);
      setPanelMode("edit");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, payload }: { serviceId: number; payload: Partial<Service> }) =>
      updateService(serviceId, payload),
    onSuccess: (updatedService) => {
      toast.success(`Updated ${updatedService.name}`);
      setIsEditOpen(false);
      setSelectedService(null);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) => deleteService(serviceId),
    onSuccess: () => {
      toast.success("Service deleted");
      setServiceToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete service: ${(mutationError as Error).message}`);
    },
  });

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedService(null);
    setIsEditOpen(true);
  };

  const openEditPanel = (service: Service) => {
    setPanelMode("edit");
    setSelectedService(service);
    setIsEditOpen(true);
  };

  const handleSaveService = async (formData: ServiceFormState) => {
    if (panelMode === "create") {
      await createServiceMutation.mutateAsync({
        name: formData.name,
        price: formData.price,
        description: formData.description,
        duration: formData.duration,
        is_publicly_offered: formData.is_publicly_offered,
        is_active: formData.is_active,
      });
      return;
    }

    if (!selectedService) {
      return;
    }

    await updateServiceMutation.mutateAsync({
      serviceId: selectedService.service_id,
      payload: {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        duration: formData.duration,
        is_publicly_offered: formData.is_publicly_offered,
        is_active: formData.is_active,
      },
    });
  };

  const services = data ?? [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageSizeOptions = [12, 24, 48].filter((size) => {
    return paginationInfo.total_items === 0 || size <= Math.max(48, paginationInfo.total_items);
  });

  const formatPrice = (price: number | null) => {
    if (price == null) {
      return "Price not set";
    }
    return currencyFormatter.format(price);
  };

  const formatDuration = (duration: number | null) => {
    if (duration == null) {
      return "Flexible duration";
    }
    const display = Number.isInteger(duration) ? duration.toFixed(0) : duration.toString();
    return `${display} min`;
  };

  const sortedServices = useMemo(
    () => services.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [services]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-6">
        <DashboardToolbar
          className="mb-5 sm:mb-6"
          left={
            <div>
              <DashboardBreadcrumbs section="directory" current="Services" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Services</h1>
            </div>
          }
          action={
            isAdmin ? (
              <Button onClick={openCreatePanel} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add Service
              </Button>
            ) : null
          }
        >
          <Input
            placeholder="Search services..."
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
        </DashboardToolbar>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            Error loading services: {(error as Error).message}
          </div>
        )}

        {!isLoading && !isError && sortedServices.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No services found. {isAdmin ? "Add one to get started." : ""}
          </div>
        )}

        {!isLoading && !isError && sortedServices.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedServices.map((service) => (
              <ManagementCard
                key={service.service_id}
                title={service.name}
                subtitle={<span className="font-medium text-foreground/80">{formatPrice(service.price)}</span>}
                badges={
                  <>
                    <Badge variant={service.is_active ? "secondary" : "outline"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={service.is_publicly_offered ? "secondary" : "outline"}>
                      {service.is_publicly_offered ? "Public" : "Private"}
                    </Badge>
                  </>
                }
                actions={
                  isAdmin ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditPanel(service)}
                        aria-label={`Edit ${service.name}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setServiceToDelete(service)}
                        aria-label={`Delete ${service.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null
                }
                footer={
                  <p className="flex items-center gap-2 text-sm text-foreground/80">
                    <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{formatDuration(service.duration)}</span>
                  </p>
                }
              >
                <p className="line-clamp-4 text-sm text-foreground/80">{service.description || "No description."}</p>
              </ManagementCard>
            ))}
          </div>
        )}

        {!isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
              itemName="services"
            />
          </div>
        )}
      </main>

      <ServiceEditPanel
        open={isEditOpen}
        service={selectedService}
        mode={panelMode}
        isSaving={createServiceMutation.isPending || updateServiceMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedService(null);
            setPanelMode("edit");
          }
        }}
        onSave={handleSaveService}
      />

      <AlertDialog
        open={!!serviceToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setServiceToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {serviceToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteServiceMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteServiceMutation.isPending || !serviceToDelete}
              onClick={async (event) => {
                event.preventDefault();
                if (!serviceToDelete) {
                  return;
                }
                await deleteServiceMutation.mutateAsync(serviceToDelete.service_id);
              }}
            >
              {deleteServiceMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
