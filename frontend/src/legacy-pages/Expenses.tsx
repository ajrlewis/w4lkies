import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, PencilLine, Plus, Tags, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequestWithResponse, create, remove, update } from "@/api/apiService";
import { usePagination } from "@/hooks/usePagination";
import { useSearchReset } from "@/hooks/useSearchReset";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import ManagementCard from "@/components/admin/ManagementCard";
import ExpenseEditPanel, { type ExpenseFormState } from "@/components/expenses/ExpenseEditPanel";
import ExpenseAggregateChart from "@/components/expenses/ExpenseAggregateChart";
import PaginationInfo from "@/components/pagination/PaginationInfo";
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
import { DEFAULT_PAGINATION, type PaginationInfo as PaginationInfoType } from "@/types/interfaces";

interface Expense {
  expense_id: number;
  date: string;
  price: number;
  description: string;
  category: string;
}

type ViewMode = "list" | "summary";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const Expenses = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { extractPaginationFromResponse } = usePagination();

  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("edit");
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);
  useSearchReset(setSearchInput);

  const {
    data: expenses = [],
    isLoading,
    isError,
    error,
  } = useQuery<Expense[]>({
    queryKey: ["expenses", currentPage, pageSize, debouncedSearchTerm],
    enabled: viewMode === "list",
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      }

      const { data, response } = await apiRequestWithResponse<Expense[]>(`/expenses?${params}`);
      const pagination = extractPaginationFromResponse(response);
      setPaginationInfo(pagination);
      return data;
    },
  });

  const { data: summaryExpenses = [] } = useQuery<Expense[]>({
    queryKey: ["expense-summary-data"],
    enabled: viewMode === "summary",
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", page_size: "1000" });
      const { data } = await apiRequestWithResponse<Expense[]>(`/expenses?${params}`);
      return data;
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize, viewMode]);

  useEffect(() => {
    if (currentPage > paginationInfo.total_pages && paginationInfo.total_pages > 0) {
      setCurrentPage(paginationInfo.total_pages);
    }
  }, [currentPage, paginationInfo.total_pages]);

  const createExpenseMutation = useMutation({
    mutationFn: (payload: ExpenseFormState) => create("expenses", payload),
    onSuccess: () => {
      toast.success("Expense created");
      setIsEditOpen(false);
      setSelectedExpense(null);
      setPanelMode("edit");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary-data"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to create expense: ${(mutationError as Error).message}`);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ expenseId, payload }: { expenseId: number; payload: ExpenseFormState }) =>
      update("expenses", expenseId.toString(), payload),
    onSuccess: () => {
      toast.success("Expense updated");
      setIsEditOpen(false);
      setSelectedExpense(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary-data"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to update expense: ${(mutationError as Error).message}`);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: number) => remove("expenses", expenseId.toString()),
    onSuccess: () => {
      toast.success("Expense deleted");
      setExpenseToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary-data"] });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete expense: ${(mutationError as Error).message}`);
    },
  });

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedExpense(null);
    setIsEditOpen(true);
  };

  const openEditPanel = (expense: Expense) => {
    setPanelMode("edit");
    setSelectedExpense(expense);
    setIsEditOpen(true);
  };

  const handleSaveExpense = async (formData: ExpenseFormState) => {
    if (panelMode === "create") {
      await createExpenseMutation.mutateAsync(formData);
      return;
    }

    if (!selectedExpense) {
      return;
    }

    await updateExpenseMutation.mutateAsync({
      expenseId: selectedExpense.expense_id,
      payload: formData,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageSizeOptions = [12, 24, 48].filter((size) => {
    return paginationInfo.total_items === 0 || size <= Math.max(48, paginationInfo.total_items);
  });

  const sortedExpenses = useMemo(
    () =>
      expenses
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-6">
        <div className="mb-5 sm:mb-6">
          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center text-sm font-medium text-accent hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Expenses</h1>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-full items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-1 sm:w-auto">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === "list" || value === "summary") {
                  setViewMode(value);
                }
              }}
              className="w-full gap-0 sm:w-auto"
            >
              <ToggleGroupItem
                value="list"
                className="h-10 min-w-[140px] flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground"
              >
                All Expenses
              </ToggleGroupItem>
              <ToggleGroupItem
                value="summary"
                className="h-10 min-w-[120px] flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground"
              >
                Summary
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            {viewMode === "list" ? (
              <>
                <Input
                  placeholder="Search expenses..."
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
              </>
            ) : null}

            {isAdmin && (
              <Button onClick={openCreatePanel} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add Expense
              </Button>
            )}
          </div>
        </div>

        {viewMode === "list" && isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {viewMode === "list" && isError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            Error loading expenses: {(error as Error).message}
          </div>
        )}

        {viewMode === "list" && !isLoading && !isError && sortedExpenses.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No expenses found. {isAdmin ? "Add one to get started." : ""}
          </div>
        )}

        {viewMode === "list" && !isLoading && !isError && sortedExpenses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedExpenses.map((expense) => (
              <ManagementCard
                key={expense.expense_id}
                title={expense.description}
                subtitle={<span className="inline-flex items-center gap-1 text-foreground/80"><Calendar className="h-3.5 w-3.5" />{formatDate(expense.date)}</span>}
                actions={
                  isAdmin ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditPanel(expense)}
                        aria-label={`Edit expense ${expense.expense_id}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setExpenseToDelete(expense)}
                        aria-label={`Delete expense ${expense.expense_id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null
                }
                footer={<p className="text-base font-semibold text-foreground">{currencyFormatter.format(expense.price)}</p>}
              >
                <p className="inline-flex items-center gap-2 text-sm text-foreground/80">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  Category: <span className="capitalize">{expense.category}</span>
                </p>
              </ManagementCard>
            ))}
          </div>
        )}

        {viewMode === "list" && !isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChange} itemName="expenses" />
          </div>
        )}

        {viewMode === "summary" && (
          <div className="mt-8 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Expense Summary</h2>
            <ExpenseAggregateChart expenses={summaryExpenses} />
          </div>
        )}
      </main>

      <ExpenseEditPanel
        open={isEditOpen}
        expense={selectedExpense}
        mode={panelMode}
        isSaving={createExpenseMutation.isPending || updateExpenseMutation.isPending}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedExpense(null);
            setPanelMode("edit");
          }
        }}
        onSave={handleSaveExpense}
      />

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setExpenseToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes this expense entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExpenseMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExpenseMutation.isPending || !expenseToDelete}
              onClick={async () => {
                if (!expenseToDelete) {
                  return;
                }
                await deleteExpenseMutation.mutateAsync(expenseToDelete.expense_id);
              }}
            >
              {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
