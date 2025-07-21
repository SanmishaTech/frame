import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import {
  Loader,
  Mail,
  Phone,
  UserRound,
  HeartPulse,
  BookOpenText,
  VideoIcon,
  CircleCheck,
  Play,
  StopCircle,
  CircleDot,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VideoRecorder from "./VideoRecorder";
import { Button } from "@/components/ui/button";

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
      <div className="flex justify-center items-center h-screen bg-[#f1f5f9]">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f1f5f9] px-4">
        <div className="text-center text-destructive text-lg font-semibold">
          Doctor not found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] py-4 px-4 min-h-screen flex justify-center items-center">
      <div className="max-w-6xl w-full">
        <Card className="shadow-2xl border border-gray-200 bg-white dark:bg-zinc-900">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary flex justify-center items-center gap-2">
              <UserRound className="text-primary" size={28} />
              Welcome, {doctor.name} {`(${doctor.degree})`}
            </CardTitle>
            <h2 className="text-lg font-semibold text-primary mt-2">
              Topic: {doctor.topic}
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Please record and submit a brief video on the given topic by
              following the instructions on this page.
            </p>
            <div className="mt-2 flex justify-center items-center gap-2 text-sm text-red-600 font-medium">
              <ShieldCheck size={18} className="text-red-500" />
              <span>
                Important: Please do not share this link with anyone. It is
                meant solely for your use and should be kept confidential.
              </span>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="mt-4">
            <div className="w-full space-y-3">
              {!isVideoCompleted ? (
                <>
                  <h3 className="text-xl font-semibold text-secondary-foreground flex items-center gap-2">
                    <VideoIcon className="text-red-500" size={22} />
                    Record Your Video Message
                  </h3>

                  <div className="mb-6 p-4 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-900 text-sm">
                    <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                      <CircleDot className="text-yellow-700" size={18} />
                      Instructions for Recording Your Video
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Click the <strong>Start</strong> button to begin
                        recording.
                      </li>
                      <li>
                        When prompted, allow your browser to access your{" "}
                        <strong>camera</strong> and <strong>microphone</strong>.
                      </li>
                      <li>
                        Your video recording will begin immediately after
                        permissions are granted.
                      </li>
                      <li>
                        Click the <strong>Finish</strong> button to stop the
                        recording and upload the video.
                      </li>
                      <li>
                        If you click <strong>Start</strong> again, your previous
                        video will be <strong>deleted</strong> and a new
                        recording will begin.
                      </li>
                      <li>
                        Wait for the upload to complete. A success message will
                        be shown once it's done.
                      </li>
                      <li>
                        You can use external microphone or lighting to record
                        your video.
                      </li>
                      <li>
                        Your video should be 1 to 3 minutes long in duration.
                      </li>
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 p-4 rounded-md bg-green-100 border border-green-300 text-green-900 text-sm">
                    <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                      <CircleCheck className="text-green-700" size={18} />
                      Video Uploaded Successfully.
                    </h4>
                    <p className="text-green-800">
                      Your video has been successfully recorded and uploaded.
                    </p>
                  </div>
                </>
              )}
              <VideoRecorder
                uuid={uuid}
                doctor={doctor}
                onVideoSuccess={() => setIsVideoCompleted(true)} // callback passed here
                isVideoCompleted={isVideoCompleted} // pass the state to VideoRecorder
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicDoctorPage;
