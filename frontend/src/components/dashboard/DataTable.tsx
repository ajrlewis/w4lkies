import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAll, remove } from "@/api/apiService";
import { Trash2, Plus, Edit, ArrowUp, ArrowDown } from "lucide-react";
import EditModal from "@/components/dashboard/EditModal";
import { useSearchReset } from "@/hooks/useSearchReset";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const modelSchemas: Record<string, string[]> = {
  users: ["user_id", "name", "email", "password", "is_admin"],
  customers: [
    "customer_id",
    "name",
    "phone",
    "emergency_contact_name",
    "emergency_contact_phone",
    "signed_up_on",
    "is_active",
  ],
  vets: ["vet_id", "name", "address", "phone"],
  dogs: [
    "dog_id",
    "name",
    "date_of_birth",
    "is_allowed_treats",
    "is_allowed_off_the_lead",
    "is_allowed_on_social_media",
    "is_neutered_or_spayed",
    "behavioral_issues",
    "medical_needs",
    "breed",
    "customer_id",
    "vet_id",
  ],
  services: ["service_id", "name", "price", "description", "duration", "is_publicly_offered", "is_active"],
  bookings: ["booking_id", "date", "time", "customer_id", "service_id", "invoice_id", "user_id"],
  invoices: [
    "invoice_id",
    "date_start",
    "date_end",
    "date_issued",
    "date_due",
    "date_paid",
    "price_subtotal",
    "price_discount",
    "price_total",
    "customer_id",
    "reference",
  ],
  expenses: ["expense_id", "date", "price", "description", "category"],
};

function DataTable({ model }: { model: string }) {
  const [data, setData] = useState<any[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useSearchReset(setSearchTerm);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setModalMode("edit");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetchAll(model);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsLoading(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await remove(model, id);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
      fetchData();
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedData = await fetchAll<any>(model);
      setData(fetchedData);

      if (fetchedData && fetchedData.length > 0) {
        setFields(Object.keys(fetchedData[0]));
      } else {
        setFields([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisiblePageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const pages: (number | string)[] = [];

    pages.push(1);

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 2) {
      pages.push("...");
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const sortData = (rows: any[]) => {
    if (!sortField) return rows;

    return [...rows].sort((a, b) => {
      if (a[sortField] === null || a[sortField] === undefined) return sortDirection === "asc" ? -1 : 1;
      if (b[sortField] === null || b[sortField] === undefined) return sortDirection === "asc" ? 1 : -1;

      if (typeof a[sortField] === "string" && typeof b[sortField] === "string") {
        const comparison = a[sortField].localeCompare(b[sortField]);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      const comparison = a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedData = sortData(filteredData);
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  useEffect(() => {
    fetchData();
  }, [model]);

  useEffect(() => {
    setPage(1);
    setSortField(null);
    setSortDirection("asc");
  }, [model]);

  return (
    <Card className="border-border/70 bg-card pt-4 sm:pt-6">
      <div className="flex flex-col gap-3 px-4 pb-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold capitalize text-foreground sm:text-2xl">{model}</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            placeholder={`Search ${model}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72"
          />
          <Button onClick={handleOpenAddModal} variant="outline" size="sm" className="w-full sm:w-auto">
            <Plus size={16} className="mr-1" /> Add New
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(field)}>
                  <div className="flex items-center gap-1">
                    {field}
                    {sortField === field ? sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : null}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="py-10 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="py-10 text-center text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  {fields.map((field) => (
                    <TableCell key={`${item.id}-${field}`} className="max-w-[220px] truncate">
                      {item[field] !== null ? String(item[field]) : ""}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(item)}>
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="hover:text-red-500">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="py-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationItem>

            {pageNumbers.map((pageNum, index) => (
              <PaginationItem key={index}>
                {typeof pageNum === "string" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink isActive={page === pageNum} onClick={() => setPage(Number(pageNum))} className="cursor-pointer">
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {isModalOpen && (
        <EditModal
          schema={modelSchemas[model] || fields}
          data={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isCreating={modalMode === "add"}
          model={model}
        />
      )}
    </Card>
  );
}

export default DataTable;
