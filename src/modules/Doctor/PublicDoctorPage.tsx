import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import logo from "../../assets/logo.jpeg";
import {
  Loader,
  UserRound,
  ShieldCheck,
  VideoIcon,
  CircleCheck,
  CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VideoRecorder from "./VideoRecorder";

const fetchDoctorByUUID = async (uuid: string) => {
  return await get(`/doctors/record/${uuid}`);
};

const PublicDoctorPage = () => {
  const { uuid } = useParams();
  const [isVideoCompleted, setIsVideoCompleted] = useState<Boolean>(false);

  const {
    data: doctor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["doctor", uuid],
    queryFn: () => fetchDoctorByUUID(uuid!),
    enabled: !!uuid,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 px-4">
        <div className="text-center text-red-600 text-lg font-semibold">
          Doctor not found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar */}
      {/* Navbar */}
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-24 px-4 md:px-6">
          {/* Mobile: Centered logo */}
          <div className="block md:hidden mx-auto">
            <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>

          {/* Desktop: Logo on left, name on right */}
          <div className="hidden md:flex items-center w-full justify-between">
            <div>
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 justify-end">
                <UserRound className="text-primary" size={24} />
                {doctor.name}
                <span className="text-sm font-normal text-gray-600">
                  ({doctor.degree})
                </span>
              </h1>
              <h2 className="text-sm font-semibold text-gray-700">
                Topic: {doctor.topic}
              </h2>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Name + Topic */}
      <div className="block md:hidden px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <UserRound className="text-primary" size={20} />
          {doctor.name}
          <span className="text-sm font-normal text-gray-600">
            ({doctor.degree})
          </span>
        </h1>
        <h2 className="text-sm font-semibold text-gray-700 mt-1">
          Topic: {doctor.topic}
        </h2>
      </div>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border border-gray-200 bg-white rounded-lg">
            <CardHeader className="px-6 pt-6 text-left">
              <p className="text-gray-700 text-base">
                Please record and submit a brief video on the given topic by
                following the instructions on this page.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 font-medium">
                <ShieldCheck size={18} className="text-red-500" />
                <span>
                  Important: Do not share this link with anyone. It's
                  confidential and for your use only.
                </span>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="px-6 py-6">
              {!isVideoCompleted ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <VideoIcon className="text-red-500" size={22} />
                    Record Your Video Message
                  </h3>

                  <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                    <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                      <CircleDot className="text-yellow-700" size={18} />
                      Instructions
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Click the <strong>Start</strong> button to begin
                        recording.
                      </li>
                      <li>
                        Allow camera & microphone permissions when prompted.
                      </li>
                      <li>
                        Recording starts right after permission is granted.
                      </li>
                      <li>
                        Click <strong>Finish</strong> to stop and upload your
                        video.
                      </li>
                      <li>
                        Wait until the upload finishes. You'll see a success
                        message.
                      </li>
                      <li>
                        You may use an external mic or light for better quality.
                      </li>
                      <li>Keep your video between 1 to 3 minutes.</li>
                    </ol>
                  </div>
                </>
              ) : (
                <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 text-green-900 text-sm">
                  <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <CircleCheck className="text-green-700" size={18} />
                    Video Uploaded Successfully
                  </h4>
                  <p>Your video has been successfully recorded and uploaded.</p>
                </div>
              )}

              <VideoRecorder
                uuid={uuid}
                doctor={doctor}
                onVideoSuccess={() => setIsVideoCompleted(true)}
                isVideoCompleted={isVideoCompleted}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PublicDoctorPage;
