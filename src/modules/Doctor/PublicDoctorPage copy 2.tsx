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
      <header className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 shadow-md border-b border-pink-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-24 px-4 md:px-6">
          {/* Mobile Logo */}
          <div className="block md:hidden mx-auto">
            <img
              src={logo}
              alt="Logo"
              className="h-16 w-auto object-contain bg-white rounded-sm"
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center w-full justify-between">
            <div>
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto object-contain bg-white rounded-sm"
              />
            </div>
            <div className="text-right text-white">
              <h1 className="text-xl font-bold flex items-center gap-2 justify-end">
                <UserRound size={24} />
                {doctor.name}
                <span className="text-sm font-normal opacity-80">
                  ({doctor.degree})
                </span>
              </h1>
              <h2 className="text-sm font-semibold opacity-90">
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

      {/* Info Card */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="shadow-lg border border-gray-200 bg-white rounded-lg">
          <CardHeader className="px-6 pt-6 text-left space-y-4">
            <p
              className="text-base font-semibold"
              style={{ color: "rgb(21, 0, 58)" }}
            >
              Please record and submit a brief video on the given topic by
              following the instructions on this page.
            </p>

            <div className="rounded-md bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-4 text-white font-medium flex items-center gap-2 text-sm shadow-md">
              <ShieldCheck size={18} className="text-white flex-shrink-0" />
              <span>
                Important: Do not share this link with anyone. It's confidential
                and for your use only.
              </span>
            </div>
          </CardHeader>

          <CardHeader className="px-6 pt-4 text-left space-y-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "rgb(21, 0, 58)" }}
            >
              <VideoIcon
                className="inline-block mr-2 text-pink-600"
                size={20}
              />
              Record Your Video Message
            </h3>

            <div className="rounded-md bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 p-4 text-white font-medium flex items-center gap-2 text-sm shadow-md">
              <CircleDot size={18} className="text-white flex-shrink-0" />
              <span>
                Please follow the instructions below carefully to record your
                video.
              </span>
            </div>

            <div className="bg-pink-50 rounded-md border border-pink-200 p-4 text-pink-900 text-sm">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CircleDot className="text-pink-600" size={18} />
                Instructions
              </h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Click the <strong>Start</strong> button to begin recording.
                </li>
                <li>Allow camera & microphone permissions when prompted.</li>
                <li>Recording starts right after permission is granted.</li>
                <li>
                  Click <strong>Finish</strong> to stop and upload your video.
                </li>
                <li>
                  Wait until the upload finishes. You'll see a success message.
                </li>
                <li>
                  You may use an external mic or light for better quality.
                </li>
                <li>Keep your video between 1 to 3 minutes.</li>
              </ol>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {isVideoCompleted ? (
              <div className="mt-6 p-4 rounded-md bg-green-50 border border-green-200 text-green-900 text-sm">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CircleCheck className="text-green-700" size={18} />
                  Video Uploaded Successfully
                </h4>
                <p>Your video has been successfully recorded and uploaded.</p>
              </div>
            ) : (
              <VideoRecorder
                uuid={uuid}
                doctor={doctor}
                onVideoSuccess={() => setIsVideoCompleted(true)}
                isVideoCompleted={isVideoCompleted}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicDoctorPage;
