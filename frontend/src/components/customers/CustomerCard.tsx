
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Customer } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, User, Calendar, Pencil, Trash2 } from "lucide-react";
import CustomerEditForm from "./CustomerEditForm";
import { toast } from "@/components/ui/sonner";
import { deleteCustomer } from "@/api/customerRequests";
import { format } from "date-fns";
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

interface CustomerCardProps {
  customer: Customer;
  onUpdate: () => void;
}

const CustomerCard = ({ customer, onUpdate }: CustomerCardProps) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteCustomer(customer.customer_id);
      toast.success(`Deleted ${customer.name}`);
      onUpdate();
    } catch (error) {
      toast.error(`Failed to delete: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Format phone number for tel: links
  const formatPhoneForLink = (phone: string) => {
    return phone?.replace(/[^\d+]/g, '') || '';
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (isEditing) {
    return (
      <Card className="w-full mb-4 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerEditForm
            customer={customer}
            onCancel={handleCancelEdit}
            onSuccess={() => {
              setIsEditing(false);
              onUpdate();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-4 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-accent dark:text-white">
          {customer.name}
        </CardTitle>
        <div className="flex items-center mt-1 gap-2">
          <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${customer.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {customer.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3 inline mr-1" />
            {formatDate(customer.signed_up_on)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <a 
            href={`tel:${formatPhoneForLink(customer.phone)}`} 
            className="text-accent hover:underline transition-colors dark:text-blue-400"
          >
            {customer.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <a 
            href={`mailto:${customer.email}`} 
            className="text-accent hover:underline transition-colors dark:text-blue-400"
          >
            {customer.email}
          </a>
        </div>
        
        {customer.emergency_contact_name && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">Emergency Contact:</div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{customer.emergency_contact_name}</span>
            </div>
            {customer.emergency_contact_phone && (
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <a 
                  href={`tel:${formatPhoneForLink(customer.emergency_contact_phone)}`} 
                  className="text-accent hover:underline transition-colors dark:text-blue-400"
                >
                  {customer.emergency_contact_phone}
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {isAdmin && (
        <CardFooter className="border-t pt-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditClick}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {customer.name} from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CustomerCard;
