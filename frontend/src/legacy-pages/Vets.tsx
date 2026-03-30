import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, PencilLine, Phone, Plus, Trash2 } from "lucide-react";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import {
  createVet,
  deleteVet,
  fetchVetsPaginated,
  updateVet,
  type CreateVetData,
} from "@/api/vetRequests";
import { Input } from "@/components/ui/input";
import { useSearchReset } from "@/hooks/useSearchReset";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { Vet } from "@/types/interfaces";
import ManagementCard from "@/components/admin/ManagementCard";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import VetEditPanel, { type VetFormState } from "@/components/vets/VetEditPanel";
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

const Vets = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("edit");
  const [vetToDelete, setVetToDelete] = useState<Vet | null>(null);
  const { extractPaginationFromResponse } = usePagination();
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["vets", currentPage, pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const { data, response } = await fetchVetsPaginated({
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

  const createVetMutation = useMutation({
    mutationFn: (payload: CreateVetData) => createVet(payload),
    onSuccess: (newVet) => {
      toast.success(`Created ${newVet.name}`);
      setIsEditOpen(false);
      setSelectedVet(null);
      setPanelMode("edit");
      queryClient.invalidateQueries({ queryKey: ["vets"] });
    },
  });

  const updateVetMutation = useMutation({
    mutationFn: ({ vetId, payload }: { vetId: number; payload: Partial<Vet> }) =>
      updateVet(vetId, payload),
    onSuccess: (updatedVet) => {
      toast.success(`Updated ${updatedVet.name}`);
      setIsEditOpen(false);
      setSelectedVet(null);
      queryClient.invalidateQueries({ queryKey: ["vets"] });
    },
  });

  const deleteVetMutation = useMutation({
    mutationFn: (vetId: number) => deleteVet(vetId),
    onSuccess: () => {
      toast.success("Vet deleted");
      setVetToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["vets"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete vet: ${(mutationError as Error).message}`);
    },
  });

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedVet(null);
    setIsEditOpen(true);
  };

  const openEditPanel = (vet: Vet) => {
    setPanelMode("edit");
    setSelectedVet(vet);
    setIsEditOpen(true);
  };

  const handleSaveVet = async (formData: VetFormState) => {
    if (panelMode === "create") {
      await createVetMutation.mutateAsync({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      });
      return;
    }

    if (!selectedVet) {
      return;
    }

    await updateVetMutation.mutateAsync({
      vetId: selectedVet.vet_id,
      payload: {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      },
    });
  };

  const vets = data ?? [];

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
        <DashboardToolbar
          className="mb-5 sm:mb-6"
          left={
            <div>
              <DashboardBreadcrumbs section="directory" current="Vets" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Vets</h1>
            </div>
          }
          action={
            isAdmin ? (
              <Button onClick={openCreatePanel} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add Vet
              </Button>
            ) : null
          }
        >
          <Input
            placeholder="Search vets..."
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
            Error loading vets: {(error as Error).message}
          </div>
        )}

        {!isLoading && !isError && vets.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No vets found. {isAdmin ? "Add one to get started." : ""}
          </div>
        )}

        {!isLoading && !isError && vets.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vets.map((vet) => (
              <ManagementCard
                key={vet.vet_id}
                title={vet.name}
                actions={
                  isAdmin ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditPanel(vet)}
                        aria-label={`Edit ${vet.name}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setVetToDelete(vet)}
                        aria-label={`Delete ${vet.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null
                }
              >
                <div className="space-y-2 text-sm text-foreground/80">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="break-words">{vet.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={`tel:${vet.phone.replace(/[^\d+]/g, "")}`}
                      className="break-words transition hover:text-primary"
                    >
                      {vet.phone}
                    </a>
                  </div>
                </div>
              </ManagementCard>
            ))}
          </div>
        )}

        {!isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChange} itemName="vets" />
          </div>
        )}
      </main>

      <VetEditPanel
        open={isEditOpen}
        vet={selectedVet}
        mode={panelMode}
        isSaving={createVetMutation.isPending || updateVetMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedVet(null);
            setPanelMode("edit");
          }
        }}
        onSave={handleSaveVet}
      />

      <AlertDialog
        open={!!vetToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setVetToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vet?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {vetToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVetMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteVetMutation.isPending || !vetToDelete}
              onClick={async () => {
                if (!vetToDelete) {
                  return;
                }
                await deleteVetMutation.mutateAsync(vetToDelete.vet_id);
              }}
            >
              {deleteVetMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vets;
