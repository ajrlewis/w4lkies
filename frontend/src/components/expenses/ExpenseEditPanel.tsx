import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileText, PoundSterling, Tags } from "lucide-react";

import { fetchAll } from "@/api/apiService";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface Expense {
  expense_id: number;
  date: string;
  price: number;
  description: string;
  category: string;
}

export interface ExpenseFormState {
  date: string;
  price: number;
  description: string;
  category: string;
}

interface ExpenseEditPanelProps {
  open: boolean;
  expense: Expense | null;
  mode: "create" | "edit";
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ExpenseFormState) => Promise<void>;
}

interface ExpenseDraftState {
  date: string;
  price: string;
  description: string;
  category: string;
}

const todayString = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM: ExpenseDraftState = {
  date: todayString(),
  price: "",
  description: "",
  category: "",
};

const ExpenseEditPanel = ({
  open,
  expense,
  mode,
  isSaving,
  onOpenChange,
  onSave,
}: ExpenseEditPanelProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState<ExpenseDraftState>(EMPTY_FORM);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (mode === "create") {
      setFormData(EMPTY_FORM);
      return;
    }

    if (!expense) {
      return;
    }

    setFormData({
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : todayString(),
      price: Number.isFinite(expense.price) ? expense.price.toString() : "",
      description: expense.description || "",
      category: expense.category || "",
    });
  }, [mode, expense, open]);

  const { data: categories = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => fetchAll<string>("expenses/categories"),
  });

  const allCategories = useMemo(() => {
    const categorySet = new Set<string>(
      categories
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    );

    if (formData.category.trim()) {
      categorySet.add(formData.category.trim());
    }

    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [categories, formData.category]);

  const parsedPrice = useMemo(() => Number.parseFloat(formData.price), [formData.price]);
  const isFormValid = useMemo(
    () =>
      formData.date.trim().length > 0 &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0 &&
      formData.description.trim().length >= 2 &&
      formData.category.trim().length > 0,
    [formData, parsedPrice]
  );

  const handleSave = async () => {
    if (!isFormValid || !Number.isFinite(parsedPrice)) {
      return;
    }

    await onSave({
      date: formData.date,
      price: parsedPrice,
      description: formData.description.trim(),
      category: formData.category.trim(),
    });
  };

  const formBody = (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-date" className="text-xs uppercase tracking-wide text-muted-foreground">
            Date
          </Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="expense-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-price" className="text-xs uppercase tracking-wide text-muted-foreground">
            Amount (GBP)
          </Label>
          <div className="relative">
            <PoundSterling className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="expense-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-category" className="text-xs uppercase tracking-wide text-muted-foreground">
          Category
        </Label>
        <div className="relative">
          <Tags className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger id="expense-category" className="pl-10">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-description" className="text-xs uppercase tracking-wide text-muted-foreground">
          Description
        </Label>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="expense-description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="min-h-[120px] pl-10"
            placeholder="Describe the expense..."
          />
        </div>
      </div>
    </div>
  );

  const actions = (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
        Cancel
      </Button>
      <Button type="button" onClick={handleSave} disabled={isSaving || !isFormValid}>
        {isSaving ? "Saving..." : mode === "create" ? "Create Expense" : "Save Changes"}
      </Button>
    </div>
  );

  if (mode === "edit" && !expense) {
    return null;
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>{mode === "create" ? "Add Expense" : "Edit Expense"}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Log a new expense entry."
                : "Update expense details, category, and amount."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 pb-6">{formBody}</div>
          {actions}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{mode === "create" ? "Add Expense" : "Edit Expense"}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Log a new expense entry."
              : "Update expense details, category, and amount."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
        <DrawerFooter>{actions}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExpenseEditPanel;
