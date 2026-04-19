import {
  type BankImportResult,
  type BankImportSummary,
  type BankStatementImport,
  type BankTransaction,
} from "@/types/interfaces";
import { apiRequest, buildApiUrl } from "./apiService";

interface FetchTransactionsOptions {
  matched?: boolean;
  search?: string;
  limit?: number;
}

export const fetchStatementImports = async (): Promise<BankStatementImport[]> => {
  return await apiRequest<BankStatementImport[]>("/finance/revolut/imports");
};

export const fetchStatementSummary = async (
  bankStatementImportId: number
): Promise<BankImportSummary> => {
  return await apiRequest<BankImportSummary>(
    `/finance/revolut/imports/${bankStatementImportId}/summary`
  );
};

export const fetchStatementTransactions = async (
  bankStatementImportId: number,
  options: FetchTransactionsOptions = {}
): Promise<BankTransaction[]> => {
  const params = new URLSearchParams();
  if (typeof options.matched === "boolean") {
    params.set("matched", String(options.matched));
  }
  if (options.search) {
    params.set("search", options.search);
  }
  if (options.limit) {
    params.set("limit", String(options.limit));
  }

  const query = params.toString();
  return await apiRequest<BankTransaction[]>(
    `/finance/revolut/imports/${bankStatementImportId}/transactions${
      query ? `?${query}` : ""
    }`
  );
};

export const uploadRevolutStatement = async (
  file: File,
  autoMatch: boolean
): Promise<BankImportResult> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("auto_match", String(autoMatch));

  const response = await fetch(buildApiUrl("/finance/revolut/import"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/signin";
      throw new Error("Authentication expired. Please sign in again.");
    }
    const errorText = await response.text();
    let detailMessage: string | null = null;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.detail) {
        detailMessage = String(parsed.detail);
      }
    } catch {
      detailMessage = null;
    }
    throw new Error(detailMessage || errorText || "Failed to upload bank statement.");
  }

  return await response.json();
};

export const matchTransaction = async (
  bankTransactionId: number,
  payload: { invoice_id?: number; expense_id?: number; note?: string }
): Promise<BankTransaction> => {
  return await apiRequest<BankTransaction>(
    `/finance/revolut/transactions/${bankTransactionId}/match`,
    "POST",
    payload
  );
};

export const unmatchTransaction = async (
  bankTransactionId: number
): Promise<BankTransaction> => {
  return await apiRequest<BankTransaction>(
    `/finance/revolut/transactions/${bankTransactionId}/unmatch`,
    "POST"
  );
};

export const rerunAutoMatch = async (
  bankStatementImportId: number
): Promise<{ auto_matched: number }> => {
  return await apiRequest<{ auto_matched: number }>(
    `/finance/revolut/imports/${bankStatementImportId}/auto_match`,
    "POST"
  );
};
