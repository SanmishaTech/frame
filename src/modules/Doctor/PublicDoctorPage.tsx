import React from "react";
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
    <div className="bg-[#f9fafb] py-4 px-4">
      {" "}
      {/* reduced py-8 to py-4 */}
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-2xl border border-gray-200 bg-white dark:bg-zinc-900">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary flex justify-center items-center gap-2">
              <UserRound className="text-primary" size={28} />
              Welcome, Dr. {doctor.name}
            </CardTitle>

            <p className="text-muted-foreground mt-1 text-sm">
              {" "}
              {/* reduced mt-2 to mt-1 */}
              Please record and submit a brief 1-minute video introduction on
              the given topic by following the instructions on this page
            </p>
            <div className="mt-2 flex justify-center items-center gap-2 text-sm text-red-600 font-medium">
              {" "}
              {/* mt-3 → mt-2 */}
              <ShieldCheck size={18} className="text-red-500" />
              <span>
                Important: Please do not share this link with anyone. It is
                meant solely for your use and should be kept confidential.
              </span>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="mt-4">
            {" "}
            {/* mt-6 → mt-4 */}
            <div className="flex flex-col md:flex-row gap-4">
              {" "}
              {/* gap-6 → gap-4 */}
              {/* Left: Doctor Info */}
              {/* Left: Doctor Info */}
              <div className="w-full md:w-1/2 pr-0 md:pr-6 space-y-6">
                {/* Main heading */}
                <h2 className="text-2xl font-bold text-secondary-foreground flex items-center gap-2">
                  <CircleDot className="text-blue-500" size={24} />
                  Doctor Information
                </h2>

                {/* Personal Details Section */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-secondary-foreground">
                    Personal Details
                  </h3>

                  <div className="flex items-center gap-3">
                    <UserRound className="text-sky-600" size={20} />
                    <span className="font-semibold text-sm text-muted-foreground min-w-[80px]">
                      Name:
                    </span>
                    <span className="font-medium text-base">{doctor.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="text-emerald-600" size={20} />
                    <span className="font-semibold text-sm text-muted-foreground min-w-[80px]">
                      Email:
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {doctor.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-orange-500" size={20} />
                    <span className="font-semibold text-sm text-muted-foreground min-w-[80px]">
                      Mobile:
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {doctor.mobile}
                    </span>
                  </div>
                </section>

                {/* Specialty Details Section */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-secondary-foreground">
                    Specialty Details
                  </h3>

                  <div className="flex items-center gap-3">
                    <HeartPulse className="text-rose-500" size={20} />
                    <span className="font-semibold text-sm text-muted-foreground min-w-[80px]">
                      Specialty:
                    </span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {doctor.specialty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <BookOpenText className="text-purple-600" size={20} />
                    <span className="font-semibold text-sm text-muted-foreground min-w-[80px]">
                      Topic:
                    </span>
                    <Badge className="bg-primary text-white text-xs capitalize">
                      {doctor.topic}
                    </Badge>
                  </div>
                </section>
              </div>
              {/* Vertical separator */}
              <div className="hidden md:block w-px bg-gray-200"></div>
              {/* Right: Video Recorder */}
              <div className="w-full md:w-1/2 space-y-3">
                {" "}
                {/* space-y-4 → space-y-3 */}
                <h3 className="text-xl font-semibold text-secondary-foreground flex items-center gap-2">
                  <VideoIcon className="text-red-500" size={22} />
                  Record Your Video Message
                </h3>
                <div className="rounded-lg border border-muted p-4 bg-muted">
                  <VideoRecorder uuid={uuid} doctor={doctor} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicDoctorPage;
