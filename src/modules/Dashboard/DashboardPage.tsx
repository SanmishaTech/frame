import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Play, Info } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { get, del, patch, post } from "@/services/apiService";
import { useState } from "react";
import { backendStaticUrl } from "@/config";

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
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState("uploadedAt"); // Default sort column
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order

  // Fetch users using react-query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["latest-doctors", sortBy, sortOrder, recordsPerPage],
    queryFn: () => fetchDoctors(sortBy, sortOrder, recordsPerPage),
  });

  const doctors = data?.doctors || [];

  const latestDoctors = doctors?.slice(0, 6) || [];

  const renderDoctorCard = (doctor) => {
    const videoUrl = doctor.filepath?.[doctor.filepath.length - 1];
    const fullVideoUrl = `${backendStaticUrl}/uploads/${doctor.uuid}/${videoUrl}`;
    return (
      <div
        key={doctor.id}
        className="relative aspect-video rounded-xl overflow-hidden group bg-gray-200 dark:bg-slate-900"
      >
        <video
          src={fullVideoUrl}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            onClick={() => {
              // open modal or navigate to video play
              window.open(fullVideoUrl, "_blank");
            }}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-100"
            title="Play Video"
          >
            <Play size={20} />
          </button>

          <button
            onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-100"
            title="Doctor Info"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Optional: Bottom bar for name */}
        <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white px-2 py-1 text-xs truncate">
          {doctor.name} — {dayjs(doctor.uploadedAt).format("DD MMM")}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="text-center mt-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Latest Uploaded Videos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Explore the most recent video uploads from our doctors. Hover over
          each video to play it or view detailed doctor information.
        </p>
      </header>
      {[0, 1, 2].map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="flex flex-1 flex-col mt-5 gap-4 p-4 pt-0"
        >
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {isLoading || isError
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-video rounded-xl bg-gray-200 dark:bg-slate-900"
                  />
                ))
              : latestDoctors
                  .slice(sectionIndex * 3, sectionIndex * 3 + 3)
                  .map((doctor) => renderDoctorCard(doctor))}
          </div>

          <Skeleton className="min-h-[100vh] flex-1 rounded-xl bg-gray-200 dark:bg-slate-900 md:min-h-min" />
        </div>
      ))}
    </>
  );
};

export default DashboardPage;
