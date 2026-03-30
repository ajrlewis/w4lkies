import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { Invoice, DEFAULT_PAGINATION, type PaginationInfo as PaginationInfoType } from "@/types/interfaces";
import {
  deleteInvoice,
  fetchInvoices,
  fetchInvoicesPaginated,
} from "@/api/invoiceRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import InvoiceGeneratePanel from "@/components/invoices/InvoiceGeneratePanel";
import InvoiceAggregateChart from "@/components/invoices/InvoiceAggregateChart";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import { usePagination } from "@/hooks/usePagination";
import { useSearchReset } from "@/hooks/useSearchReset";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type InvoiceStatusFilter = "all" | "pending" | "paid";

const Invoices = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { extractPaginationFromResponse } = usePagination();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    ...DEFAULT_PAGINATION,
    page_size: 12,
  });
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "summary">("list");
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  useSearchReset(setSearchInput);

  const {
    data: invoices = [],
    isLoading,
    isError,
    error,
  } = useQuery<Invoice[]>({
    queryKey: ["invoices", currentPage, pageSize, debouncedSearchTerm, statusFilter],
    enabled: viewMode === "list",
    queryFn: async () => {
      const { data, response } = await fetchInvoicesPaginated({
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
        is_paid:
          statusFilter === "all" ? undefined : statusFilter === "paid",
      });

      const pagination = extractPaginationFromResponse(response);
      setPaginationInfo(pagination);
      return data;
    },
  });

  const { data: summaryInvoices = [] } = useQuery<Invoice[]>({
    queryKey: ["invoice-summary-data"],
    queryFn: fetchInvoices,
    enabled: viewMode === "summary",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, pageSize, viewMode]);

  useEffect(() => {
    if (currentPage > paginationInfo.total_pages && paginationInfo.total_pages > 0) {
      setCurrentPage(paginationInfo.total_pages);
    }
  }, [currentPage, paginationInfo.total_pages]);

  const handleGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["invoice-summary-data"] });
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    await deleteInvoice(invoiceId);
    await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    await queryClient.invalidateQueries({ queryKey: ["invoice-summary-data"] });
  };

  const pageSizeOptions = [12, 24, 48].filter((size) => {
    return paginationInfo.total_items === 0 || size <= Math.max(48, paginationInfo.total_items);
  });

  const sortedInvoices = useMemo(
    () =>
      invoices
        .slice()
        .sort((a, b) => new Date(b.date_issued).getTime() - new Date(a.date_issued).getTime()),
    [invoices]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-6">
        <div className="mb-5 sm:mb-6">
          <div>
            <DashboardBreadcrumbs section="operations" current="Invoices" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invoices</h1>
          </div>
        </div>

        <DashboardToolbar
          rightClassName="sm:flex-wrap lg:flex-nowrap"
          action={
            isAdmin ? (
              <Button onClick={() => setIsGenerateOpen(true)} className="h-10">
                <Plus className="mr-1 h-4 w-4" />
                Add Invoice
              </Button>
            ) : null
          }
        >
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
                className="h-10 min-w-[120px] flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground"
              >
                History
              </ToggleGroupItem>
              <ToggleGroupItem
                value="summary"
                className="h-10 min-w-[120px] flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground"
              >
                Summary
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {viewMode === "list" ? (
            <>
              <Input
                placeholder="Search invoices..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-64"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InvoiceStatusFilter)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-foreground"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
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
        </DashboardToolbar>

        {viewMode === "list" && isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {viewMode === "list" && isError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            Error loading invoices: {(error as Error).message}
          </div>
        )}

        {viewMode === "list" && !isLoading && !isError && sortedInvoices.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No invoices found. {isAdmin ? "Add one to get started." : ""}
          </div>
        )}

        {viewMode === "list" && !isLoading && !isError && sortedInvoices.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.invoice_id}
                invoice={invoice}
                onDelete={isAdmin ? handleDeleteInvoice : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {viewMode === "list" && !isLoading && !isError && paginationInfo.total_pages > 1 && (
          <div className="mt-8">
            <PaginationInfo paginationInfo={paginationInfo} onPageChange={handlePageChange} itemName="invoices" />
          </div>
        )}

        {viewMode === "summary" && (
          <Card className="mt-8 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Invoice Summary</h2>
            <InvoiceAggregateChart invoices={summaryInvoices} />
          </Card>
        )}
      </main>

      <InvoiceGeneratePanel
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        onGenerated={handleGenerated}
      />
    </div>
  );
};

export default Invoices;
