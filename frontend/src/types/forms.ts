
import { z } from "zod";

export const signupFormSchema = z.object({
  customer: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(5, { message: "Please enter a valid phone number" }),
    emergency_contact_name: z.string().min(2, { message: "Emergency contact name is required" }),
    emergency_contact_phone: z.string().min(5, { message: "Emergency contact phone is required" }),
  }),
  dogs: z.array(
    z.object({
      name: z.string().min(1, { message: "Dog's name is required" }),
      breed: z.string().min(1, { message: "Dog's breed is required" }),
      date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
      vet: z.string().min(1, { message: "Vet information is required" }),
      vet_name: z.string().default(""),
      vet_address: z.string().default(""),
      behavioral_issues: z.string().optional().default(""),
      medical_needs: z.string().optional().default(""),
      is_allowed_treats: z.boolean().default(false),
      is_allowed_off_the_lead: z.boolean().default(false),
      is_allowed_on_social_media: z.boolean().default(false),
      is_neutered_or_spayed: z.boolean().default(false),
      customer_id: z.number().optional().default(0),
      vet_id: z.number().optional().default(0),
      dog_id: z.number().optional().default(0),
    })
  ).min(1, { message: "At least one dog is required" }),
  declaration: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
