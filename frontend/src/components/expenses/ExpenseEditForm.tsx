
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { create, update, fetchAll } from "@/api/apiService";
import { toast } from "@/components/ui/sonner";

interface Expense {
  expense_id: number;
  date: string;
  price: number;
  description: string;
  category: string;
}

interface ExpenseEditFormProps {
  expense?: Expense;
  onCancel: () => void;
  onSuccess: () => void;
}

const ExpenseEditForm = ({ expense, onCancel, onSuccess }: ExpenseEditFormProps) => {
  const [formData, setFormData] = useState({
    date: expense?.date ? new Date(expense.date) : new Date(),
    price: expense?.price?.toString() || "",
    description: expense?.description || "",
    category: expense?.category || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => fetchAll<string>('expenses/categories')
  });

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.price || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const expenseData = {
        date: formData.date.toISOString().split('T')[0], // Convert Date back to string for API
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: formData.category
      };

      if (expense) {
        await update("expenses", expense.expense_id.toString(), expenseData);
        toast.success("Expense updated successfully");
      } else {
        await create("expenses", expenseData);
        toast.success("Expense created successfully");
      }
      
      onSuccess();
    } catch (error) {
      toast.error(expense ? "Failed to update expense" : "Failed to create expense");
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange("date", new Date(e.target.value))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Enter expense description..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseEditForm;
