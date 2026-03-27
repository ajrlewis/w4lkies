
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, ShieldCheck, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface DogInfoSectionProps {
  form: UseFormReturn<any>;
  index: number;
  onRemove: () => void;
  isOnly: boolean;
}

const DogInfoSection = ({ form, index, onRemove, isOnly }: DogInfoSectionProps) => {
  return (
    <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[rgb(var(--color-primary))]" />
          <h3 className="text-xl font-semibold text-[rgb(var(--color-accent))] dark:text-white">Dog {index + 1}</h3>
        </div>
        {!isOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
            Remove Dog
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`dogs.${index}.dogName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1 text-black dark:text-white">
                <Heart className="h-4 w-4" />
                Dog's Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Your dog's name" {...field} className="bg-white dark:bg-gray-900" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={`dogs.${index}.dateOfBirth`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1 text-black dark:text-white">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" className="bg-white dark:bg-gray-900" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`dogs.${index}.breed`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1 text-black dark:text-white">
                Breed
              </FormLabel>
              <FormControl>
                <Input placeholder="Dog's breed" {...field} className="bg-white dark:bg-gray-900" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={`dogs.${index}.vet`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1 text-black dark:text-white">
                <ShieldCheck className="h-4 w-4" />
                Vet Information
              </FormLabel>
              <FormControl>
                <Input placeholder="Vet's name and contact" {...field} className="bg-white dark:bg-gray-900" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`dogs.${index}.allowedTreats`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[rgb(var(--color-primary))] data-[state=checked]:border-[rgb(var(--color-primary))]"
                />
              </FormControl>
              <FormLabel className="font-normal text-black dark:text-white">Allowed treats?</FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={`dogs.${index}.allowedOffLead`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[rgb(var(--color-primary))] data-[state=checked]:border-[rgb(var(--color-primary))]"
                />
              </FormControl>
              <FormLabel className="font-normal text-black dark:text-white">Allowed off the lead?</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`dogs.${index}.allowedSocialMedia`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[rgb(var(--color-primary))] data-[state=checked]:border-[rgb(var(--color-primary))]"
                />
              </FormControl>
              <FormLabel className="font-normal text-black dark:text-white">Allowed on Instagram/Website?</FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={`dogs.${index}.neuteredOrSpayed`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[rgb(var(--color-primary))] data-[state=checked]:border-[rgb(var(--color-primary))]"
                />
              </FormControl>
              <FormLabel className="font-normal text-black dark:text-white">Neutered/Spayed?</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`dogs.${index}.behavioralIssues`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black dark:text-white">Behavioral Issues</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Please describe any behavioral issues..."
                {...field} 
                className="bg-white dark:bg-gray-900 min-h-[100px]" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`dogs.${index}.medicalNeeds`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black dark:text-white">Medical Needs / Allergies</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Please describe any medical needs or allergies..."
                {...field} 
                className="bg-white dark:bg-gray-900 min-h-[100px]" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DogInfoSection;
