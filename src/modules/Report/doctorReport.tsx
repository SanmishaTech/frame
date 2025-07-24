// import React, { useState } from "react";
// import { Button, Input } from "@/components/ui";
// import { useMutation } from "@tanstack/react-query";
// import { post } from "@/services/apiService";
// import { toast } from "sonner";
// import { Download } from "lucide-react";
// import {
//   Card,
//   CardTitle,
//   CardContent,
//   CardDescription,
//   CardHeader,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";

// const doctorReport = () => {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [state, setState] = useState("");

//   const reportMutation = useMutation({
//     mutationFn: async (data: {
//       fromDate: string;
//       toDate: string;
//       state: string;
//     }) => {
//       return await post("/reports/doctors", data, {
//         responseType: "blob", // If downloading a file
//       });
//     },
//     onSuccess: (response) => {
//       toast.success("Report generated successfully");

//       const blob = new Blob([response], { type: "application/octet-stream" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `Doctor_Report_${new Date().toISOString()}.xlsx`; // or .csv/.pdf
//       a.click();
//       window.URL.revokeObjectURL(url);
//     },
//     onError: () => {
//       toast.error("Failed to generate report");
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!fromDate || !toDate) {
//       toast.warning("Please select both From and To dates");
//       return;
//     }

//     reportMutation.mutate({ fromDate, toDate, state });
//   };

//   return (
//     <>
//       <div className="mt-2 p-6">
//         <h1 className="text-2xl font-bold mb-6">Doctor Report</h1>

//         <Card className="w-full mx-auto mt-10">
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold">
//               Download Doctor Report
//             </CardTitle>
//             <CardDescription>
//               Select the date range and state to download an Excel report of
//               doctors.
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     From Date
//                   </label>
//                   <Input
//                     type="date"
//                     value={fromDate}
//                     onChange={(e) => setFromDate(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     To Date
//                   </label>
//                   <Input
//                     type="date"
//                     value={toDate}
//                     onChange={(e) => setToDate(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     State
//                   </label>
//                   <Select value={state} onValueChange={setState}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select State" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All States</SelectItem>
//                       <SelectItem value="Delhi">Delhi</SelectItem>
//                       <SelectItem value="Maharashtra">Maharashtra</SelectItem>
//                       <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button
//                   type="submit"
//                   className="flex items-center gap-2"
//                   disabled={reportMutation.isPending}
//                 >
//                   <Download size={16} />
//                   {reportMutation.isPending
//                     ? "Generating..."
//                     : "Download Report"}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// };

// export default doctorReport;
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { post, get } from "@/services/apiService";
import { toast } from "sonner";
import { Download, ChevronsUpDown, Check } from "lucide-react";
import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
// ------------------
// Zod Schema
// ------------------
const doctorReportSchema = z.object({
  fromDate: z.string().min(1, "From Date is required"),
  toDate: z.string().min(1, "To Date is required"),
  state: z.string().optional(),
});

type DoctorReportFormData = z.infer<typeof doctorReportSchema>;

// ------------------
// Component
// ------------------
const DoctorReport = () => {
  const [openState, setOpenState] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DoctorReportFormData>({
    resolver: zodResolver(doctorReportSchema),
    defaultValues: {
      fromDate: "",
      toDate: "",
      state: "",
    },
  });
  //   const MAHARASHTRA = "MAHARASHTRA"; // Assuming this is the state you want to set by default

  // states
  const { data: states, isLoading: isStatesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const response = await get(`/states/all`);
      return response;
    },
  });

  //   useEffect(() => {
  //     if (states && states.length > 0) {
  //       // Find Maharashtra by label (or by your exact API property)
  //       const maharashtraState = states.find(
  //         (state) => state.label === MAHARASHTRA
  //       );

  //       if (maharashtraState) {
  //         setValue("state", maharashtraState.value);
  //       }
  //     }
  //   }, [states, setValue]);
  const reportMutation = useMutation({
    mutationFn: async (data: DoctorReportFormData) => {
      return await post("/reports/doctors", data, {
        responseType: "blob",
      });
    },
    onSuccess: (response, _variables) => {
      toast.success("Report generated successfully");

      const formatDate = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}_${mm}_${yyyy}`;
      };

      const fromDate = formatDate(_variables.fromDate);
      const toDate = formatDate(_variables.toDate);
      const stateSuffix = _variables.state ? `_${_variables.state}` : "";

      const filename = `doctor_report_${fromDate}_to_${toDate}${stateSuffix}.xlsx`;

      const blob = new Blob([response], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error("Failed to generate report");
    },
  });

  const onSubmit = (data: DoctorReportFormData) => {
    const from = new Date(data.fromDate);
    const to = new Date(data.toDate);

    if (from > to) {
      toast.warning("From Date must be before or equal to To Date");
      return;
    }
    reportMutation.mutate(data);
  };

  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Video Report</h1>

      <Card className="w-full mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Download Doctor Video Report
          </CardTitle>
          <CardDescription>
            Select the date range and state to download an Excel report of
            doctors.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* From Date */}
              <div>
                <Label
                  htmlFor="fromDate"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  From Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.fromDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fromDate.message}
                  </p>
                )}
              </div>

              {/* To Date */}
              <div>
                <Label
                  htmlFor="toDate"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  To Date
                </Label>
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.toDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.toDate.message}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <Label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  State
                </Label>
                {/* <div className="w-full pt-1"> */}
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openState} onOpenChange={setOpenState}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openState}
                          className="w-[310px] justify-between"
                          onClick={() => setOpenState((prev) => !prev)}
                        >
                          {field.value
                            ? states.find((s) => s.value === field.value)?.label
                            : "Select State..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[310px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search state..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup>
                              {states?.map((state) => (
                                <CommandItem
                                  key={state.value}
                                  value={state.value}
                                  onSelect={(currentValue) => {
                                    setValue("state", currentValue);
                                    setOpenState(false);
                                  }}
                                >
                                  {state.label}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      state.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />

                {/* </div> */}
                {errors.state && (
                  <p className="text-destructive text-xs absolute -bottom-5">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={reportMutation.isPending}
              >
                <Download size={16} />
                {reportMutation.isPending ? "Generating..." : "Download Report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReport;
