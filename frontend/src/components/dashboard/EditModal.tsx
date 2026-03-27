
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { update, create } from "@/api/apiService";
import { toast } from "sonner";

interface EditModalProps {
  schema: string[];
  data: Record<string, any> | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  isCreating: boolean;
  model: string;
}

const EditModal = ({ schema, data, onClose, onSave, isCreating, model }: EditModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(data || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isCreating) {
        await create(model, formData);
      } else {
        const idField = `${model.slice(0, -1)}_id`;
        const id = formData[idField];
        await update(model, id.toString(), formData);
      }
      
      onSave(formData);
      toast.success(isCreating ? "Created successfully" : "Updated successfully");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getFieldType = (field: string, value: any) => {
    if (field.includes("is_")) return "checkbox";
    if (field.includes("date")) return "date";
    if (field.includes("price") || field.includes("total")) return "number";
    if (field.includes("password")) return "password";
    if (field.includes("email")) return "email";
    return "text";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? `Create New ${model.slice(0, -1)}` : `Edit ${model.slice(0, -1)}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {schema.map((field) => {
            if (isCreating && field === `${model.slice(0, -1)}_id`) return null;
            
            const fieldType = getFieldType(field, formData[field]);
            
            return fieldType === "checkbox" ? (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={!!formData[field]}
                  onCheckedChange={(checked) => handleChange(field, checked)}
                />
                <Label htmlFor={field} className="cursor-pointer">
                  {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ) : (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field} className="text-right">
                  {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <Input
                  id={field}
                  type={fieldType}
                  value={formData[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="col-span-3"
                  disabled={!isCreating && field === `${model.slice(0, -1)}_id`}
                />
              </div>
            );
          })}
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (isCreating ? "Create" : "Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
