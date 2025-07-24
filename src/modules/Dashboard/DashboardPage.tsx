import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { get } from "@/services/apiService";
import { useState } from "react";
import { backendStaticUrl } from "@/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Calendar,
  FileVideo,
  User2,
  MapPin,
  Stethoscope,
  BookText,
  Download,
  Loader,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Mail,
  Filter,
  ShieldEllipsis,
  Search,
  PlusCircle,
  MoreHorizontal,
  Phone,
  GraduationCap,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
const fetchDoctors = async (
  sortBy: string,
  sortOrder: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/dashboard/latest-videos?sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${recordsPerPage}`
  );
  return response;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [recordsPerPage] = useState(10);
  const [sortBy] = useState("uploadedAt");
  const [sortOrder] = useState("desc");

  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["latest-doctors", sortBy, sortOrder, recordsPerPage],
    queryFn: () => fetchDoctors(sortBy, sortOrder, recordsPerPage),
  });

  const doctors = data?.doctors || [];
  const latestDoctors = doctors?.slice(0, 6) || [];

  const handleView = (doctor: any) => {
    const videoFile = doctor.filepath?.[doctor.filepath.length - 1];
    const fullPath = `${doctor.uuid}/${videoFile}`;

    setSelectedDoctor(doctor);
    setSelectedFile(fullPath);
    setIsVideoDialogOpen(true);
  };

  return (
    <div className="mt-10 px-4 space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Latest Uploaded Videos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Browse recent uploads with details like doctor info, topic, and more.
        </p>
      </div>

      {/* Card Table */}
      <Card className="shadow-md border ">
        <CardContent>
          <div className="overflow-x-auto w-full rounded-md">
            <Table className="min-w-full text-xs">
              <TableHeader className="bg-muted/50 text-gray-700 dark:text-gray-100">
                <TableRow>
                  <TableHead className="px-4 py-2">Name</TableHead>
                  <TableHead className="px-4 py-2">specialty</TableHead>
                  <TableHead className="px-4 py-2">State</TableHead>
                  <TableHead className="px-4 py-2">Topic</TableHead>
                  <TableHead className="px-4 py-2">Uploaded</TableHead>
                  <TableHead className="px-4 py-2 text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading || isError
                  ? [...Array(6)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-6 w-full rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))
                  : latestDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="max-w-[250px] break-words whitespace-normal py-3">
                          <div className="flex flex-col gap-1  text-gray-800 dark:text-gray-100">
                            <div className="flex items-start gap-2">
                              <User2 className="w-4 h-4 mt-[2px] text-muted-foreground" />
                              <span className="font-bold">{doctor.name}</span>
                            </div>

                            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                              <Mail className="w-4 h-4 mt-[2px]" />
                              <span className="break-all">{doctor.email}</span>
                            </div>

                            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4 mt-[2px]" />
                              <span>{doctor.mobile}</span>
                            </div>

                            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                              <GraduationCap className="w-4 h-4 mt-[2px]" />
                              <span>{doctor.degree}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground max-w-[250px] whitespace-normal break-words">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            {doctor.specialty || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground max-w-[250px] whitespace-normal break-words">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {doctor.state || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground max-w-[250px] whitespace-normal break-words">
                          <div className="flex items-center gap-2">
                            <BookText className="w-4 h-4" />
                            {doctor.topic || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground max-w-[250px] break-words  whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(doctor.uploadedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs px-3"
                            onClick={() => handleView(doctor)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Video Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-h-[100vh] sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Doctor Video</DialogTitle>
            <DialogDescription>
              Video from the doctor - {selectedDoctor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <video
              controls
              autoPlay
              className="w-full max-h-[430px] rounded shadow-md border object-contain"
              src={`${backendStaticUrl}/uploads/${selectedFile}`}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={async () => {
                const fileUrl = `${backendStaticUrl}/uploads/${selectedFile}`;
                try {
                  const response = await fetch(fileUrl);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);

                  const originalFileName =
                    selectedFile.split("/").pop() || "video.mp4";

                  const link = document.createElement("a");
                  link.href = url;
                  link.download = originalFileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  toast.error("Failed to download video.");
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
