import React, { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import MultipleSelector, {
  Option,
} from "@/components/common/multiple-selector"; // Import MultipleSelector from common folder
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatter.js";
import { backendStaticUrl } from "@/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCopy, CheckCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, del, patch, post } from "@/services/apiService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import CustomPagination from "@/components/common/custom-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Loader,
  ChevronUp,
  Play,
  ChevronDown,
  Edit,
  Trash2,
  Mail,
  Filter,
  Download,
  ShieldEllipsis,
  Search,
  PlusCircle,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { saveAs } from "file-saver";
import { Badge } from "@/components/ui/badge"; // Ensure Badge is imported
import { frontendUrl } from "../../config";
const fetchDoctors = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/doctors?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const DoctorList = () => {
  const queryClient = useQueryClient();
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState<string | null>(
    null
  );
  const [copiedDoctorId, setCopiedDoctorId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState("name"); // Default sort column
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  const [showConfirmation, setShowConfirmation] = useState(false); // State to show/hide confirmation dialog
  const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null); //
  //  Track the user ID to delete
  const navigate = useNavigate();

  // Fetch users using react-query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "doctors",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchDoctors(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const doctors = data?.doctors || [];
  const totalPages = data?.totalPages || 1;
  const totalDoctors = data?.totalDoctors || 0;

  // Mutation for deleting a user
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/doctors/${id}`),
    onSuccess: () => {
      toast.success("Doctor deleted successfully");
      queryClient.invalidateQueries([
        "doctors",
        currentPage,
        sortBy,
        sortOrder,
        search,
        recordsPerPage,
      ]);
    },
    onError: (error) => {
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete Doctor");
      }
    },
  });

  // Mutation for deleting a user
  const EmailMutation = useMutation({
    mutationFn: (id: number) => post(`/doctors/${id}/send-email`),
    onSuccess: () => {
      toast.success("Email send to Doctor successfully");
    },
    onError: (error) => {
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Error sending email to Doctor");
      }
    },
  });

  const confirmDelete = (id: number) => {
    setDoctorToDelete(id);
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    if (doctorToDelete) {
      deleteMutation.mutate(doctorToDelete);
      setShowConfirmation(false);
      setDoctorToDelete(null);
    }
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending order
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const copyToClipboard = async (text: string, doctorId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDoctorId(doctorId);
      toast.success("Video link copied to clipboard!");
      setTimeout(() => setCopiedDoctorId(null), 2000); // Reset after 2s
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Doctor Management
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-grow">
              <Input
                placeholder="Search doctors..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => navigate("/doctors/create")}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Doctor
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Table Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="mr-2 h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Failed to load doctors.
            </div>
          ) : doctors.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Doctor Name</span>
                        {sortBy === "name" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort("email")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        {sortBy === "email" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("mobile")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Mobile</span>
                        {sortBy === "mobile" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("specialty")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Specialty</span>
                        {sortBy === "specialty" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("topic")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Topic</span>
                        {sortBy === "topic" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>

                    <TableHead>Video</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {doctor.name}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {doctor.email || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {doctor.mobile || "N/A"}
                      </TableCell>
                      <TableCell>{doctor.specialty || "N/A"}</TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {doctor.topic || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                              onClick={() => {
                                setSelectedVideoUrl(
                                  `${backendStaticUrl}/uploads/${doctor.uuid}/${doctor.filepath}`
                                );
                                setSelectedDoctorName(doctor.name);
                                setIsVideoDialogOpen(true);
                              }}
                              disabled={!doctor.filepath} // Disable if no video available
                            >
                              <Play size={16} />
                            </button>
                          </TooltipTrigger>

                          <TooltipContent>
                            <p>Play Video</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                              onClick={() => EmailMutation.mutate(doctor.id)}
                              disabled={EmailMutation.isPending}
                            >
                              <Mail size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Send Email</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                                onClick={() =>
                                  navigate(`/doctors/${doctor.id}/edit`)
                                }
                              >
                                <Edit size={16} />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Edit Doctor</p>
                            </TooltipContent>
                          </Tooltip> */}

                          {/* <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                                onClick={() => confirmDelete(doctor.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Delete Doctor</p>
                            </TooltipContent>
                          </Tooltip> */}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setTimeout(() => {
                                      confirmDelete(doctor.id);
                                    }, 0);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Trash2 size={16} /> Delete
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    navigate(`/doctors/${doctor.id}/edit`)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    const videoUrl = `${frontendUrl}/doctors/record/${doctor.uuid}`;
                                    copyToClipboard(videoUrl, doctor.id);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {copiedDoctorId === doctor.id ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-green-700 font-medium">
                                          Link Copied
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <ClipboardCopy className="h-4 w-4" />
                                        <span>Copy Video Link</span>
                                      </>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalDoctors}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage} // Pass setCurrentPage directly
                onRecordsPerPageChange={(newRecordsPerPage) => {
                  setRecordsPerPage(newRecordsPerPage);
                  setCurrentPage(1); // Reset to the first page when records per page changes
                }}
              />
            </div>
          ) : (
            <div className="text-center">No Doctors Found.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-h-[100vh] sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Doctor Video</DialogTitle>
            <DialogDescription>
              Video from the doctor - {selectedDoctorName}
            </DialogDescription>
          </DialogHeader>

          {selectedVideoUrl && (
            <div className="mt-2">
              <video
                controls
                autoPlay
                className="w-full max-h-[430px] rounded shadow-md border object-contain"
                src={selectedVideoUrl}
              />
            </div>
          )}

          {/* <div className="mt-2 flex justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div> */}
          <div className="mt-4 flex justify-end gap-2">
            {/* Download Button */}
            {selectedVideoUrl && (
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch(selectedVideoUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    const originalFileName =
                      selectedVideoUrl.split("/").pop() || "video.mp4";

                    const link = document.createElement("a");
                    link.href = url;
                    link.download = originalFileName;
                    document.body.appendChild(link);
                    link.click();

                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error("Download failed", error);
                    toast.error("Failed to download video.");
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}

            {/* Close Button */}
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={showConfirmation}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Doctor? This action cannot be undone."
        onCancel={() => {
          setShowConfirmation(false);
          setDoctorToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DoctorList;
