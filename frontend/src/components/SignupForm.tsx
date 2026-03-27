import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SignupFormData, signupFormSchema } from "@/types/forms";
import { useFieldArray } from "react-hook-form";
import PersonalDetailsForm from "./signup/PersonalDetailsForm";
import DogDetailsForm from "./signup/DogDetailsForm";
import DeclarationForm from "./signup/DeclarationForm";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/api/apiService";
import { Card, CardContent } from "@/components/ui/card";

const SignupForm = () => {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      customer: {
        name: "",
        email: "",
        phone: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      },
      dogs: [
        {
          name: "",
          breed: "",
          date_of_birth: "",
          vet: "",
          vet_name: "",
          vet_address: "",
          behavioral_issues: "",
          medical_needs: "",
          is_allowed_treats: false,
          is_allowed_off_the_lead: false,
          is_allowed_on_social_media: false,
          is_neutered_or_spayed: false,
          customer_id: 0,
          vet_id: 0,
          dog_id: 0,
        },
      ],
      declaration: false,
    },
  });

  const { append, remove } = useFieldArray({
    name: "dogs",
    control: form.control,
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const transformedData = {
        ...data,
        dogs: data.dogs.map((dog) => ({
          name: dog.name,
          breed: dog.breed,
          date_of_birth: dog.date_of_birth,
          behavioral_issues: dog.behavioral_issues,
          medical_needs: dog.medical_needs,
          is_allowed_treats: dog.is_allowed_treats,
          is_allowed_off_the_lead: dog.is_allowed_off_the_lead,
          is_allowed_on_social_media: dog.is_allowed_on_social_media,
          is_neutered_or_spayed: dog.is_neutered_or_spayed,
          vet_name: dog.vet_name,
          vet_address: dog.vet_address,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/sign_up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted.",
        className: "text-black",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error!",
        description: "There was an error submitting your application.",
        variant: "destructive",
      });
    }
  };

  const handleAddDog = () => {
    append({
      name: "",
      breed: "",
      date_of_birth: "",
      vet: "",
      vet_name: "",
      vet_address: "",
      behavioral_issues: "",
      medical_needs: "",
      is_allowed_treats: false,
      is_allowed_off_the_lead: false,
      is_allowed_on_social_media: false,
      is_neutered_or_spayed: false,
      customer_id: 0,
      vet_id: 0,
      dog_id: 0,
    });
  };

  const handleRemoveDog = (index: number) => {
    remove(index);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <Card className="border-border/70 bg-muted/40">
          <CardContent className="p-4 sm:p-6">
            <PersonalDetailsForm form={form} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/40">
          <CardContent className="p-4 sm:p-6">
            <DogDetailsForm form={form} onAddDog={handleAddDog} onRemoveDog={handleRemoveDog} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/40">
          <CardContent className="p-4 sm:p-6">
            <DeclarationForm form={form} />
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Submit Application
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
