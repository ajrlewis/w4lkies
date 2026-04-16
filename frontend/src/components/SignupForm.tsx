import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SignupFormData, signupFormSchema } from "@/types/forms";
import { useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PersonalDetailsForm from "./signup/PersonalDetailsForm";
import DogDetailsForm from "./signup/DogDetailsForm";
import DeclarationForm from "./signup/DeclarationForm";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/api/apiService";

const sectionClass =
  "rounded-[1.7rem] border border-border/70 bg-card/95 p-5 shadow-[0_20px_40px_-30px_rgba(25,30,38,0.4)] sm:p-7";

const SignupForm = () => {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit form");
      }

      toast({
        title: "Success!",
        description:
          "Your application has been submitted. Please check your inbox (and junk folder) for confirmation. Redirecting you home...",
        className: "text-black",
      });

      form.reset();

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/", { replace: true });
      }, 1800);
    } catch (error) {
      const description =
        error instanceof Error && error.message
          ? error.message
          : "There was an error submitting your application.";

      toast({
        title: "Error!",
        description,
        variant: "destructive",
      });
    }
  };

  const onInvalid = () => {
    toast({
      title: "Please check the form",
      description: "Complete the required fields and accept the declaration before submitting.",
      variant: "destructive",
    });

    const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus();
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
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 sm:space-y-8">
        <section className={sectionClass}>
          <PersonalDetailsForm form={form} />
        </section>

        <section className={sectionClass}>
          <DogDetailsForm form={form} onAddDog={handleAddDog} onRemoveDog={handleRemoveDog} />
        </section>

        <section className={sectionClass}>
          <DeclarationForm form={form} />
        </section>

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition hover:bg-primary/90 sm:max-w-sm"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
