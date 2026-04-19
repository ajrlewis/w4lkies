import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Link2,
  Link2Off,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";

import AppNavbar from "@/components/AppNavbar";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  fetchStatementImports,
  fetchStatementSummary,
  fetchStatementTransactions,
  matchTransaction,
  rerunAutoMatch,
  unmatchTransaction,
  uploadRevolutStatement,
} from "@/api/financeRequests";
import type {
  BankImportSummary,
  BankStatementImport,
  BankTransaction,
} from "@/types/interfaces";

type MatchFilter = "all" | "matched" | "unmatched";

const gbpCurrency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const Reconciliation = () => {
  const queryClient = useQueryClient();
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoMatchOnImport, setAutoMatchOnImport] = useState(true);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const { data: statementImports = [], isLoading: isImportsLoading } = useQuery<
    BankStatementImport[]
  >({
    queryKey: ["reconciliation-imports"],
    queryFn: fetchStatementImports,
  });

  useEffect(() => {
    if (!statementImports.length) {
      setSelectedImportId(null);
      return;
    }
    setSelectedImportId((previous) => {
      if (previous && statementImports.some((item) => item.bank_statement_import_id === previous)) {
        return previous;
      }
      return statementImports[0].bank_statement_import_id;
    });
  }, [statementImports]);

  const { data: summary } = useQuery<BankImportSummary>({
    queryKey: ["reconciliation-summary", selectedImportId],
    enabled: Boolean(selectedImportId),
    queryFn: () => fetchStatementSummary(selectedImportId as number),
  });

  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery<
    BankTransaction[]
  >({
    queryKey: ["reconciliation-transactions", selectedImportId, matchFilter, debouncedSearch],
    enabled: Boolean(selectedImportId),
    queryFn: () =>
      fetchStatementTransactions(selectedImportId as number, {
        matched: matchFilter === "all" ? undefined : matchFilter === "matched",
        search: debouncedSearch || undefined,
        limit: 1000,
      }),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) {
        throw new Error("Choose a Revolut CSV/XLSX file first.");
      }
      return uploadRevolutStatement(selectedFile, autoMatchOnImport);
    },
    onSuccess: (result) => {
      toast.success(
        `Imported ${result.transactions_created} transactions (${result.auto_matched} auto-matched).`
      );
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["reconciliation-imports"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-summary"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-transactions"] });
      setSelectedImportId(result.statement_import.bank_statement_import_id);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const rerunAutoMatchMutation = useMutation({
    mutationFn: (importId: number) => rerunAutoMatch(importId),
    onSuccess: (result) => {
      toast.success(`Auto-match linked ${result.auto_matched ?? 0} transactions.`);
      queryClient.invalidateQueries({ queryKey: ["reconciliation-summary"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-imports"] });
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const matchMutation = useMutation({
    mutationFn: ({
      transaction,
      suggestion,
    }: {
      transaction: BankTransaction;
      suggestion: BankTransaction["suggestions"][number];
    }) =>
      matchTransaction(transaction.bank_transaction_id, {
        invoice_id: suggestion.entity_type === "invoice" ? suggestion.entity_id : undefined,
        expense_id: suggestion.entity_type === "expense" ? suggestion.entity_id : undefined,
        note: `Matched from suggestion (${Math.round(suggestion.confidence * 100)}% confidence).`,
      }),
    onSuccess: () => {
      toast.success("Transaction matched.");
      queryClient.invalidateQueries({ queryKey: ["reconciliation-summary"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-imports"] });
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const unmatchMutation = useMutation({
    mutationFn: (bankTransactionId: number) => unmatchTransaction(bankTransactionId),
    onSuccess: () => {
      toast.success("Transaction unmatched.");
      queryClient.invalidateQueries({ queryKey: ["reconciliation-summary"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation-imports"] });
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const activeImport = useMemo(
    () =>
      statementImports.find((item) => item.bank_statement_import_id === selectedImportId) || null,
    [statementImports, selectedImportId]
  );

  const formatAmount = (amount: number) => gbpCurrency.format(amount);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return dateFormatter.format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-emerald-50/40">
      <AppNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <DashboardBreadcrumbs section="operations" current="Reconciliation" />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Bank Reconciliation
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Import Revolut CSV/XLSX statements, auto-match transactions to invoices and
            expenses, and complete manual review from one professional workflow.
          </p>
        </div>

        <Card className="mb-6 overflow-hidden border-emerald-200/60 shadow-md">
          <CardContent className="grid gap-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-5 text-white md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-100">Transactions</p>
              <p className="text-2xl font-semibold">{summary?.total_transactions ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-100">Matched</p>
              <p className="text-2xl font-semibold">{summary?.matched_transactions ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-100">Unmatched</p>
              <p className="text-2xl font-semibold">{summary?.unmatched_transactions ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Import Revolut Statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block rounded-xl border border-dashed border-emerald-300/80 bg-emerald-50/70 p-4">
                <span className="mb-2 block text-sm font-medium text-foreground">
                  Upload CSV or XLSX
                </span>
                <Input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] ?? null)
                  }
                />
                <span className="mt-2 block text-xs text-muted-foreground">
                  {selectedFile ? selectedFile.name : "No file selected."}
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={autoMatchOnImport}
                  onChange={(event) => setAutoMatchOnImport(event.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Run auto-match immediately after import
              </label>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => uploadMutation.mutate()}
                  disabled={!selectedFile || uploadMutation.isPending}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {uploadMutation.isPending ? "Importing..." : "Import Statement"}
                </Button>

                <Button
                  variant="outline"
                  disabled={!selectedImportId || rerunAutoMatchMutation.isPending}
                  onClick={() =>
                    selectedImportId && rerunAutoMatchMutation.mutate(selectedImportId)
                  }
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {rerunAutoMatchMutation.isPending ? "Running..." : "Re-run Auto-Match"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm text-muted-foreground">
                Active import
                <select
                  className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-foreground"
                  value={selectedImportId ?? ""}
                  onChange={(event) =>
                    setSelectedImportId(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                >
                  {statementImports.map((item) => (
                    <option
                      key={item.bank_statement_import_id}
                      value={item.bank_statement_import_id}
                    >
                      {item.file_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Period</span>
                  <span>
                    {formatDate(activeImport?.date_start ?? null)} -{" "}
                    {formatDate(activeImport?.date_end ?? null)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span>{activeImport?.currency ?? "—"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Imported</span>
                  <span>{formatDate(activeImport?.imported_at ?? null)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-emerald-200/70 bg-emerald-50 p-2">
                  <p className="text-xs text-muted-foreground">Inflows</p>
                  <p className="font-medium text-emerald-700">
                    {formatAmount(summary?.total_inflows ?? 0)}
                  </p>
                </div>
                <div className="rounded-lg border border-rose-200/70 bg-rose-50 p-2">
                  <p className="text-xs text-muted-foreground">Outflows</p>
                  <p className="font-medium text-rose-700">
                    {formatAmount(summary?.total_outflows ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Transaction Matching Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardToolbar className="mb-3" rightClassName="sm:flex-wrap">
              <Input
                placeholder="Search description, counterparty, or reference..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full sm:w-80"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Status</span>
                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-foreground"
                  value={matchFilter}
                  onChange={(event) => setMatchFilter(event.target.value as MatchFilter)}
                >
                  <option value="all">All</option>
                  <option value="matched">Matched</option>
                  <option value="unmatched">Unmatched</option>
                </select>
              </label>
            </DashboardToolbar>

            {isImportsLoading || isTransactionsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : !selectedImportId ? (
              <div className="py-8 text-center text-muted-foreground">
                Import a statement to begin reconciliation.
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No transactions match your current filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="w-[130px]">Amount</TableHead>
                    <TableHead className="w-[200px]">Status</TableHead>
                    <TableHead className="w-[380px]">Suggestions / Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const isMatched =
                      Boolean(transaction.matched_invoice_id) ||
                      Boolean(transaction.matched_expense_id);
                    return (
                      <TableRow key={transaction.bank_transaction_id}>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {transaction.description || "No description"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.counterparty || transaction.raw_reference || "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center gap-1 font-medium ${
                              transaction.amount >= 0
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {transaction.amount >= 0 ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                            {formatAmount(transaction.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isMatched ? (
                            <div className="space-y-1">
                              <Badge className="bg-emerald-600 text-white">Matched</Badge>
                              <p className="text-xs text-muted-foreground">
                                {transaction.matched_label || "Linked record"}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="outline">Unmatched</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isMatched ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={unmatchMutation.isPending}
                              onClick={() =>
                                unmatchMutation.mutate(transaction.bank_transaction_id)
                              }
                            >
                              <Link2Off className="mr-2 h-4 w-4" />
                              Unmatch
                            </Button>
                          ) : transaction.suggestions.length ? (
                            <div className="space-y-2">
                              {transaction.suggestions.map((suggestion) => (
                                <div
                                  key={`${transaction.bank_transaction_id}-${suggestion.entity_type}-${suggestion.entity_id}`}
                                  className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-2 py-1.5"
                                >
                                  <span className="text-xs font-medium text-foreground">
                                    {suggestion.label}
                                  </span>
                                  <Badge variant="outline">
                                    {Math.round(suggestion.confidence * 100)}%
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7"
                                    disabled={matchMutation.isPending}
                                    onClick={() =>
                                      matchMutation.mutate({ transaction, suggestion })
                                    }
                                  >
                                    <Link2 className="mr-1 h-3.5 w-3.5" />
                                    Match
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No confident suggestion yet.
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reconciliation;
