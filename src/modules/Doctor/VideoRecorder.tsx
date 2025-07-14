import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backendUrl } from "@/config";
import axios from "axios";
import { Play, StopCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

function VideoRecorder({ uuid, doctor }) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const queryClient = useQueryClient();

  const deleteVideoMutation = useMutation({
    mutationFn: (uuid) =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/delete`),
    onSuccess: () => {
      toast.success("Previous video deleted");
      queryClient.invalidateQueries(["doctor", uuid]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete previous video");
    },
  });

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    setProgressMessage("Processing video...");

    mediaRecorderRef.current.onstop = async () => {
      try {
        await axios.post(`${backendUrl}doctors/record/${uuid}/finish`);
        toast.success("Video merged successfully");
        setShowSuccessDialog(true);
        setProgressMessage("Video merged successfully");
      } catch (error) {
        console.error("❌ Merge error:", error);
        toast.error("Video merge failed");
        setProgressMessage("Video merge failed");
      }
    };

    mediaRecorderRef.current.stop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    clearInterval(timerRef.current);
    setTimer(0);
  };

  const startRecordingStream = async () => {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported("video/webm")) {
      toast.error("Your browser doesn't support WebM recording.");
      return;
    }

    try {
      setIsRecording(true);
      setProgressMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      const uploadChunk = async (formData) => {
        let retries = 3;
        while (retries > 0) {
          try {
            await axios.post(`${backendUrl}doctors/record/${uuid}`, formData);
            console.log("Chunk uploaded successfully");
            return;
          } catch (error) {
            console.error("❌ Chunk upload error:", error);
            retries -= 1;
            if (retries === 0) {
              toast.error("Failed to upload chunk after multiple attempts.");
            }
          }
        }
      };

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const blob = new Blob([event.data], { type: "video/webm" });
          const formData = new FormData();
          formData.append("video", blob, "chunk.webm");
          await uploadChunk(formData);
        }
      };

      // Start recording in 3-second chunks
      mediaRecorderRef.current.start(3000);

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Failed to access camera or microphone.");
      console.error("❌ Stream error:", error);
      setIsRecording(false);
    }
  };

  const handleStartRecording = () => {
    deleteVideoMutation.mutate(uuid, {
      onSuccess: startRecordingStream,
      onError: () => {
        toast.error(
          "Failed to delete previous video. Cannot start new recording."
        );
      },
    });
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center px-4">
      <div className="flex justify-center mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="h-64 max-w-lg w-full bg-black rounded shadow-md"
        />
      </div>

      <div className="flex gap-4 mt-2">
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 
          ${
            isRecording
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          <Play size={16} />
          Start Recording
        </button>

        <button
          onClick={handleStopRecording}
          disabled={!isRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 
          ${
            !isRecording
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-700 hover:bg-red-800"
          }`}
        >
          <StopCircle size={16} />
          Finish & Upload
        </button>
      </div>

      {isRecording && (
        <div className="mt-4 text-xl font-bold">Timer: {formatTime(timer)}</div>
      )}

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <CheckCircle size={32} />
              <div>
                <AlertDialogTitle className="text-lg font-semibold">
                  Video Uploaded Successfully!
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-sm text-muted-foreground">
                  Thank you! Your video has been recorded and uploaded.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="btn">
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VideoRecorder;
