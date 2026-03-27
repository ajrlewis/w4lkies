
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Tag } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { remove } from "@/api/apiService";
import { toast } from "@/components/ui/sonner";
import ExpenseEditForm from "./ExpenseEditForm";

interface Expense {
  expense_id: number;
  date: string;
  price: number;
  description: string;
  category: string;
}

interface ExpenseCardProps {
  expense: Expense;
  onUpdate: () => void;
}

const ExpenseCard = ({ expense, onUpdate }: ExpenseCardProps) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await remove("expenses", expense.expense_id.toString());
      toast.success("Expense deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error("Error deleting expense:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'food': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'supplies': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'utilities': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'maintenance': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'equipment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    };
    return colors[category.toLowerCase()] || colors['other'];
  };

  if (isEditing) {
    return (
      <Card className="w-full bg-white dark:bg-gray-800 shadow-md">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Edit Expense</h3>
          <ExpenseEditForm
            expense={expense}
            onCancel={handleCancelEdit}
            onSuccess={handleSaveEdit}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-2">{expense.description}</h3>
          </div>
          <Badge className={getCategoryColor(expense.category)}>
            {expense.category}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(expense.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <span className="text-xl font-bold text-green-600">{formatCurrency(expense.price)}</span>
          </div>
        </div>
      </CardContent>
      
      {isAdmin && (
        <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ExpenseCard;
