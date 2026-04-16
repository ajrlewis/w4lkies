import { Dog } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { SignupFormData } from "@/types/forms";
import { Button } from "@/components/ui/button";
import DogBasicInfo from "./DogBasicInfo";
import DogPermissions from "./DogPermissions";
import DogHealth from "./DogHealth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DogDetailsFormProps {
  form: UseFormReturn<SignupFormData>;
  onAddDog: () => void;
  onRemoveDog: (index: number) => void;
}

const DogDetailsForm = ({ form, onAddDog, onRemoveDog }: DogDetailsFormProps) => {
  const { fields } = form.control._formValues.dogs
    ? { fields: form.control._formValues.dogs }
    : { fields: [] };

  return (
    <div className="space-y-5">
      <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-foreground">
        <Dog className="h-5 w-5 text-primary" />
        Dog Information
      </h3>

      {fields.map((field, index) => (
        <div key={index} className="space-y-4 rounded-xl border border-border/70 bg-background p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-foreground sm:text-lg">Dog #{index + 1}</h4>
            {index > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm">
                    Remove Dog
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove this dog?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove Dog #{index + 1} and all entered details for this section.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">Keep Dog</AlertDialogCancel>
                    <AlertDialogAction
                      type="button"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onRemoveDog(index)}
                    >
                      Remove Dog
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <DogBasicInfo form={form} index={index} />
          <DogPermissions form={form} index={index} />
          <DogHealth form={form} index={index} />
        </div>
      ))}

      <Button
        type="button"
        onClick={onAddDog}
        className="h-11 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:max-w-sm"
      >
        Add Another Dog
      </Button>
    </div>
  );
};

export default DogDetailsForm;
