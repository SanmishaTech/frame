import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Validate from "@/lib/Handlevalidation";

import { LoaderCircle } from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post, put } from "@/services/apiService";

export const FormSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be left blank.") // Ensuring minimum length of 2
    .max(100, "Name must not exceed 100 characters.")
    .refine((val) => /^[A-Za-z\s\u0900-\u097F]+$/.test(val), {
      message: "Name can only contain letters.",
    }),

  email: z.string().email("Invalid email format.").min(1, "Email is required."),
  mobile: z
    .string()
    .length(10, "Mobile number must be exactly 10 digits.")
    .refine((val) => /^[0-9]{10}$/.test(val), {
      message: "Mobile number must contain only digits (0–9).",
    }),

  degree: z
    .string()
    .min(1, "Degree cannot be left blank.")
    .max(100, "Degree must not exceed 100 characters."),

  designation: z
    .string()
    .max(100, "Designation must not exceed 100 characters.")
    .optional()
    .or(z.literal("")), // Accept empty string as optional

  specialty: z
    .string()
    .min(1, "Specialty cannot be left blank.")
    .max(100, "Specialty must not exceed 100 characters."),

  topic: z
    .string()
    .min(1, "Topic cannot be left blank.")
    .max(200, "Topic must not exceed 200 characters."),
});

type FormInputs = z.infer<typeof FormSchema>;

const DoctorForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    name: "",
    email: "",
    mobile: "",
    degree: "",
    designation: "", // optional field, using empty string
    specialty: "",
    topic: "",
  };

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: mode === "create" ? defaultValues : undefined, // Use default values in create mode
    mode: "onChange", // 👈 triggers validation on each change
    reValidateMode: "onChange", // 👈 re-validate on every change
  });

  const { data: editDoctorData, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["editDoctorData", id],
    queryFn: async () => {
      const response = await get(`/doctors/${id}`);
      return response; // API returns the sector object directly
    },
    enabled: !!id && mode === "edit",
  });

  useEffect(() => {
    if (editDoctorData) {
      reset({
        name: editDoctorData?.name ? editDoctorData.name : "",
        email: editDoctorData?.email ? editDoctorData.email : "",
        mobile: editDoctorData?.mobile ? editDoctorData.mobile : "",
        degree: editDoctorData?.degree ? editDoctorData.degree : "",
        designation: editDoctorData?.designation
          ? editDoctorData.designation
          : "",
        specialty: editDoctorData?.specialty ? editDoctorData.specialty : "",
        topic: editDoctorData?.topic ? editDoctorData.topic : "",
      });
    }
  }, [editDoctorData, reset]);

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/doctors", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]); // Refetch the users list
      toast.success("Doctor created successfully");
      navigate("/doctors"); // Navigate to the hotels page after successful creation
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to create Doctor");
    },
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => put(`/doctors/${id}`, data),
    onSuccess: () => {
      toast.success("Doctor updated successfully");
      queryClient.invalidateQueries(["doctors"]);
      navigate("/doctors"); // Navigate to the hotels page after successful update
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to update Doctor");
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // if (data.mobile && data.mobile.length <= 3) {
    //   data.mobile = ""; // Set the mobile to an empty string if only country code is entered
    // }
    if (mode === "create") {
      createMutation.mutate(data); // Trigger create mutation
    } else {
      updateMutation.mutate(data); // Trigger update mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* JSX Code for DoctorForm.tsx */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="mx-auto mt-10">
          <CardContent className="pt-6">
            {/* Doctor Details */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Doctor Information
            </CardTitle>
            <CardDescription>
              Basic details used for identification and contact.
            </CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Name */}
              <div className="md:col-span-2">
                <Label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="name"
                      placeholder="Enter doctor's name"
                      {...field}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter doctor's email"
                      {...field}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 my-3 gap-4">
              {/* Mobile */}
              <div>
                <Label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mobile <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="mobile"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      minLength={10}
                      {...field}
                    />
                  )}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* Degree */}
              <div>
                <Label
                  htmlFor="degree"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Degree <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="degree"
                  control={control}
                  render={({ field }) => (
                    <Input id="degree" placeholder="Enter degree" {...field} />
                  )}
                />
                {errors.degree && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.degree.message}
                  </p>
                )}
              </div>

              {/* Designation (Optional) */}
              <div className="hidden">
                <Label
                  htmlFor="designation"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Designation
                </Label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="designation"
                      placeholder="Enter designation (optional)"
                      {...field}
                    />
                  )}
                />
                {errors.designation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.designation.message}
                  </p>
                )}
              </div>

              {/* Specialty */}
              <div>
                <Label
                  htmlFor="specialty"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Specialty <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="specialty"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="specialty"
                      placeholder="Enter specialty"
                      {...field}
                    />
                  )}
                />
                {errors.specialty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.specialty.message}
                  </p>
                )}
              </div>

              {/* Topic */}
              <div className="lg:col-span-3">
                <Label
                  htmlFor="topic"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Topic <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="topic"
                  control={control}
                  render={({ field }) => (
                    <Input id="topic" placeholder="Enter topic" {...field} />
                  )}
                />
                {errors.topic && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.topic.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/doctors")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[90px]">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : mode === "create" ? (
                "Create Doctor"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </>
  );
};

export default DoctorForm;
