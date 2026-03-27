import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import {
  createUser,
  fetchUsersPaginated,
  updateUser,
  UserCreatePayload,
  UserUpdatePayload,
} from "@/api/userRequests";
import { ArrowLeft, PencilLine, Plus, ShieldCheck, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchReset } from "@/hooks/useSearchReset";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { User } from "@/types/interfaces";
import UserEditPanel, { type UserFormState } from "@/components/users/UserEditPanel";
import ManagementCard from "@/components/admin/ManagementCard";
import { usePagination } from "@/hooks/usePagination";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import { DEFAULT_PAGINATION, type PaginationInfo as PaginationInfoType } from "@/types/interfaces";
import { useEffect } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const Users = () => {
  const { isAdmin, username } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("edit");
  const { extractPaginationFromResponse } = usePagination();
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", currentPage, pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const { data, response } = await fetchUsersPaginated({
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
      });
      const pagination = extractPaginationFromResponse(response);
      setPaginationInfo(pagination);
      return data;
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize]);

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UserUpdatePayload }) =>
      updateUser(userId, payload),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Updated ${updatedUser.username}`);
      setIsEditOpen(false);
      setSelectedUser(null);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),
    onSuccess: (createdUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Created ${createdUser.username}`);
      setIsEditOpen(false);
      setSelectedUser(null);
      setPanelMode("edit");
    },
  });

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedUser(null);
    setIsEditOpen(true);
  };

  const handleEdit = (user: User) => {
    setPanelMode("edit");
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSaveUser = async (formData: UserFormState) => {
    if (panelMode === "create") {
      await createUserMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        is_admin: formData.is_admin,
        is_active: formData.is_active,
      });
      return;
    }

    if (!selectedUser) {
      return;
    }

    await updateUserMutation.mutateAsync({
      userId: selectedUser.user_id,
      payload: {
        username: formData.username,
        email: formData.email,
        is_admin: formData.is_admin,
        is_active: formData.is_active,
      },
    });
  };

  const users = data ?? [];

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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
          </div>

          {isAdmin && (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Input
                placeholder="Search users..."
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
              <Button onClick={openCreatePanel} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add User
              </Button>
            </div>
          )}
        </div>

        {!isAdmin && (
          <Card className="rounded-xl border border-border/70 bg-card p-5 text-center text-muted-foreground">
            You do not have permission to view users.
          </Card>
        )}

        {isAdmin && isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {isAdmin && isError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            Error loading users: {(error as Error).message}
          </div>
        )}

        {isAdmin && !isLoading && !isError && users.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No users found.</div>
        )}

        {isAdmin && !isLoading && !isError && users.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <ManagementCard
                key={user.user_id}
                title={user.username}
                subtitle={user.email}
                badges={
                  <Badge variant={user.is_active ? "secondary" : "outline"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                }
                actions={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(user)}
                    aria-label={`Edit ${user.username}`}
                  >
                    <PencilLine className="h-4 w-4" />
                  </Button>
                }
              >
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  {user.is_admin ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Admin access
                    </>
                  ) : (
                    <>
                      <ShieldX className="h-4 w-4 text-muted-foreground" />
                      Standard access
                    </>
                  )}
                </div>
              </ManagementCard>
            ))}
          </div>
        )}

        {isAdmin && !isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChange} itemName="users" />
          </div>
        )}
      </main>
      <UserEditPanel
        open={isEditOpen}
        mode={panelMode}
        user={selectedUser}
        currentUsername={username}
        isSaving={updateUserMutation.isPending || createUserMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedUser(null);
            setPanelMode("edit");
          }
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default Users;
