"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";
import CustomFormField from "../ui/CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { PatientFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { registerPatient } from "@/lib/actions/patient.actions"; // Removed createUser
import { FormFieldType } from "./PatientForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  GenderOptions,
  PatientFormDefaultValues,
} from "@/constants";
import { Label } from "../ui/label";

interface RegisterFormProps {
  user?: User; // Make user optional
}

const RegisterForm: React.FC<RegisterFormProps> = ({ user }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: user?.name || '', // Provide fallback value
      email: user?.email || '', // Provide fallback value
      phone: user?.phone || '', // Provide fallback value
    },
  });

  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoading(true);

    let formData;

    if (values.identificationDocument && values.identificationDocument.length > 0) {
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      });
      formData = new FormData();
      formData.append("blobFile", blobFile);
      formData.append("fileName", values.identificationDocument[0].name);
    }

    try {
      const patientData = {
        ...values,
        userId: user?.$id, // Ensure user ID is fetched safely
        birthDate: new Date(values.birthDate),
        identificationDocument: formData,
      };
      // @ts-expect-error: Ignore potential issues with formData
      const patient = await registerPatient(patientData);

      if (patient) router.push(`/patients/${user?.$id}/new-appointment`); // Ensure user ID is fetched safely
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
        <section className="space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Let us know more about yourself</p>
        </section>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Personal Information</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Full Name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="Johndoe@example.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />

          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone number"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
            name="birthDate"
            label="Date of Birth"
          />

          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            control={form.control}
            name="gender"
            label="Gender"
            renderSkeleton={(field) => (
              <FormControl>
                <RadioGroup
                  className="flex h-11 gap-6 xl:justify-between"
                  onValueChange={field.onChange}
                  defaultValue={typeof field.value === 'string' ? field.value : undefined}
                >
                  {GenderOptions.map((option) => (
                    <div key={option} className="radio-group">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        </div>

        {/* Additional form fields and sections remain unchanged */}

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
