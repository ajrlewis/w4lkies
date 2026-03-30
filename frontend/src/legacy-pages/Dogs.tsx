import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, PencilLine, Plus, ShieldCheck, ShieldX, Trash2, UserRound } from "lucide-react";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import {
  createDog,
  deleteDog,
  fetchDogsPaginated,
  updateDog,
  type CreateDogData,
} from "@/api/dogRequests";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchReset } from "@/hooks/useSearchReset";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { Dog } from "@/types/interfaces";
import ManagementCard from "@/components/admin/ManagementCard";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import DogEditPanel, { type DogFormState } from "@/components/dogs/DogEditPanel";
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

const Dogs = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("edit");
  const [dogToDelete, setDogToDelete] = useState<Dog | null>(null);
  const { extractPaginationFromResponse } = usePagination();
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dogs", currentPage, pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const { data, response } = await fetchDogsPaginated({
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

  const createDogMutation = useMutation({
    mutationFn: (payload: CreateDogData) => createDog(payload),
    onSuccess: (newDog) => {
      toast.success(`Created ${newDog.name}`);
      setIsEditOpen(false);
      setSelectedDog(null);
      setPanelMode("edit");
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
    },
  });

  const updateDogMutation = useMutation({
    mutationFn: ({ dogId, payload }: { dogId: number; payload: Partial<Dog> }) =>
      updateDog(dogId, payload),
    onSuccess: (updatedDog) => {
      toast.success(`Updated ${updatedDog.name}`);
      setIsEditOpen(false);
      setSelectedDog(null);
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
    },
  });

  const deleteDogMutation = useMutation({
    mutationFn: (dogId: number) => deleteDog(dogId),
    onSuccess: () => {
      toast.success("Dog deleted");
      setDogToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete dog: ${(mutationError as Error).message}`);
    },
  });

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedDog(null);
    setIsEditOpen(true);
  };

  const openEditPanel = (dog: Dog) => {
    setPanelMode("edit");
    setSelectedDog(dog);
    setIsEditOpen(true);
  };

  const handleSaveDog = async (formData: DogFormState) => {
    if (panelMode === "create") {
      await createDogMutation.mutateAsync({
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        breed: formData.breed,
        customer_id: formData.customer_id,
        vet_id: formData.vet_id,
        medical_needs: formData.medical_needs,
        behavioral_issues: formData.behavioral_issues,
        is_allowed_treats: formData.is_allowed_treats,
        is_allowed_off_the_lead: formData.is_allowed_off_the_lead,
        is_allowed_on_social_media: formData.is_allowed_on_social_media,
        is_neutered_or_spayed: formData.is_neutered_or_spayed,
      });
      return;
    }

    if (!selectedDog) {
      return;
    }

    await updateDogMutation.mutateAsync({
      dogId: selectedDog.dog_id,
      payload: {
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        breed: formData.breed,
        customer_id: formData.customer_id,
        vet_id: formData.vet_id,
        medical_needs: formData.medical_needs,
        behavioral_issues: formData.behavioral_issues,
        is_allowed_treats: formData.is_allowed_treats,
        is_allowed_off_the_lead: formData.is_allowed_off_the_lead,
        is_allowed_on_social_media: formData.is_allowed_on_social_media,
        is_neutered_or_spayed: formData.is_neutered_or_spayed,
      },
    });
  };

  const dogs = data ?? [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageSizeOptions = [12, 24, 48].filter((size) => {
    return paginationInfo.total_items === 0 || size <= Math.max(48, paginationInfo.total_items);
  });

  const formatDateOfBirth = (date: string | null | undefined) => {
    if (!date) {
      return "Unknown";
    }
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-6">
        <DashboardToolbar
          className="mb-5 sm:mb-6"
          left={
            <div>
              <DashboardBreadcrumbs section="directory" current="Dogs" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dogs</h1>
            </div>
          }
          action={
            isAdmin ? (
              <Button onClick={openCreatePanel} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add Dog
              </Button>
            ) : null
          }
        >
          <Input
            placeholder="Search dogs..."
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
            Error loading dogs: {(error as Error).message}
          </div>
        )}

        {!isLoading && !isError && dogs.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No dogs found. {isAdmin ? "Add one to get started." : ""}
          </div>
        )}

        {!isLoading && !isError && dogs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dogs.map((dog) => {
              const dateOfBirth = formatDateOfBirth(dog.date_of_birth);

              return (
                <ManagementCard
                  key={dog.dog_id}
                  title={dog.name}
                  subtitle={
                    <div className="inline-flex items-center gap-2">
                      <Badge variant="secondary">{dog.breed || "Breed not set"}</Badge>
                    </div>
                  }
                  actions={
                    isAdmin ? (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditPanel(dog)}
                          aria-label={`Edit ${dog.name}`}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDogToDelete(dog)}
                          aria-label={`Delete ${dog.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null
                  }
                  footer={
                    <div className="space-y-2 text-sm text-foreground/80">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>Born {dateOfBirth}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>Owner: {dog.customer?.name || `Customer #${dog.customer_id}`}</span>
                        {dog.customer?.is_active === false ? (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        ) : null}
                      </p>
                      <p className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>Vet: {dog.vet?.name || `Vet #${dog.vet_id}`}</span>
                      </p>
                    </div>
                  }
                >
                  <div className="space-y-3 text-sm text-foreground/80">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Medical Needs
                      </p>
                      <p className="mt-1 break-words">
                        {dog.medical_needs?.trim() ? dog.medical_needs : "None specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Behavioral Issues
                      </p>
                      <p className="mt-1 break-words">
                        {dog.behavioral_issues?.trim() ? dog.behavioral_issues : "None specified"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant={dog.is_allowed_treats ? "secondary" : "outline"}>
                        Treats {dog.is_allowed_treats ? "allowed" : "restricted"}
                      </Badge>
                      <Badge variant={dog.is_allowed_off_the_lead ? "secondary" : "outline"}>
                        Off-lead {dog.is_allowed_off_the_lead ? "allowed" : "restricted"}
                      </Badge>
                      <Badge variant={dog.is_allowed_on_social_media ? "secondary" : "outline"}>
                        Social {dog.is_allowed_on_social_media ? "allowed" : "restricted"}
                      </Badge>
                      <Badge variant={dog.is_neutered_or_spayed ? "secondary" : "outline"}>
                        {dog.is_neutered_or_spayed ? (
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Neutered/Spayed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <ShieldX className="h-3.5 w-3.5" />
                            Not neutered/spayed
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </ManagementCard>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChange} itemName="dogs" />
          </div>
        )}
      </main>

      <DogEditPanel
        open={isEditOpen}
        dog={selectedDog}
        mode={panelMode}
        isSaving={createDogMutation.isPending || updateDogMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedDog(null);
            setPanelMode("edit");
          }
        }}
        onSave={handleSaveDog}
      />

      <AlertDialog
        open={!!dogToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDogToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dog?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {dogToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDogMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteDogMutation.isPending || !dogToDelete}
              onClick={async () => {
                if (!dogToDelete) {
                  return;
                }
                await deleteDogMutation.mutateAsync(dogToDelete.dog_id);
              }}
            >
              {deleteDogMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dogs;
