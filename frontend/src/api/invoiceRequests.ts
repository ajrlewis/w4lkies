
import { Invoice } from '@/types/interfaces';
import { apiRequest, apiRequestWithResponse } from './apiService';

interface FetchInvoicesOptions {
  page?: number;
  page_size?: number;
  is_paid?: boolean;
  search?: string;
}

// Fetch all invoices
export const fetchInvoices = async (): Promise<Invoice[]> => {
  return await apiRequest<Invoice[]>('/invoices');
};

export const fetchInvoicesPaginated = async (
  options: FetchInvoicesOptions = {}
): Promise<{ data: Invoice[]; response: Response }> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (typeof options.is_paid === "boolean") params.set("is_paid", String(options.is_paid));
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  return await apiRequestWithResponse<Invoice[]>(`/invoices${query ? `?${query}` : ""}`);
};

// Get invoice by id
export const fetchInvoiceById = async (id: number): Promise<Invoice> => {
  if (!id || id === undefined || id === null) {
    throw new Error(`Invalid invoice ID: ${id}`);
  }
  return await apiRequest<Invoice>(`/invoices/${id}`);
};

// Generate invoice for a customer between dates
export const generateInvoice = async (customerId: number, dateStart: string, dateEnd: string): Promise<Invoice> => {
  return await apiRequest<Invoice>('/invoices/generate', 'POST', {
    customer_id: customerId,
    date_start: dateStart,
    date_end: dateEnd
  });
};

// Download invoice (returns blob)
export const downloadInvoice = async (id: number): Promise<Blob> => {
  if (!id || id === undefined || id === null) {
    throw new Error(`Invalid invoice ID for download: ${id}`);
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"}/invoices/${id}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  console.log("response = ", response);

  if (!response.ok) {
    throw new Error('Failed to download invoice');
  }
  
  // return await response.blob();


  let blob: Blob;
  try {
    blob = await response.blob();
  } catch (err) {
    console.error("Failed to convert response to Blob:", err);
    throw new Error("Invalid Blob received from server");
  }

  if (!(blob instanceof Blob)) {
    console.error("Response is not a Blob:", blob);
    throw new Error("Invalid blob type");
  }
  console.log("response = ", response);
  console.log("response.headers = ", response.headers);
  const contentDisposition = response.headers.get('content-disposition');
  console.log("contentDisposition = ", contentDisposition);
  let filename = 'invoice.pdf'; // Fallback

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return blob;
};

// Delete invoice
export const deleteInvoice = async (id: number): Promise<void> => {
  if (!id || id === undefined || id === null) {
    throw new Error(`Invalid invoice ID for deletion: ${id}`);
  }
  return await apiRequest<void>(`/invoices/${id}`, 'DELETE');
};

// Mark invoice as paid
export const markInvoicePaid = async (id: number): Promise<Invoice> => {
  if (!id || id === undefined || id === null) {
    throw new Error(`Invalid invoice ID for marking paid: ${id}`);
  }
  return await apiRequest<Invoice>(`/invoices/${id}/mark_as_paid`, 'PUT');
};
