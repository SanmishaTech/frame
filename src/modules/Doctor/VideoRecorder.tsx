import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backendUrl } from "@/config";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CirclePlay, CircleStop, CircleCheck } from "lucide-react";

function VideoRecorder({ uuid, doctor, onVideoSuccess, isVideoCompleted }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chunkIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const activeRecorderRef = useRef(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/cleanup`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] }),
    onError: (e) => console.error("Delete error:", e),
  });

  const uploadChunkMutation = useMutation({
    mutationFn: ({ blob, filename, stop = false }) => {
      const form = new FormData();
      form.append("filename", filename);
      form.append("video", blob, filename);
      form.append("stop", String(stop));

      return axios.post(`${backendUrl}doctors/record/${uuid}`, form);
    },
    onError: () => toast.error("Chunk upload failed"),
  });

  const generateDatetimeFilename = () => {
    return (
      new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\./g, "-")
        .replace("T", "T") + ".webm"
    );
  };

  const startChunkRecording = () => {
    if (!streamRef.current) return;

    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm",
      });
    } catch (err) {
      toast.error("Recording not supported on this browser");
      return;
    }

    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: "video/webm" });
        const filename = generateDatetimeFilename();
        uploadChunkMutation.mutate({
          filename,
          stop: recorder.stopFlag === true, // ✅ FINAL chunk check
          blob,
        });
      } catch {
        toast.error("Failed to process video chunk");
      }
    };

    recorder.start();
    activeRecorderRef.current = recorder;

    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
      if (activeRecorderRef.current === recorder)
        activeRecorderRef.current = null;
    }, 20000);
  };

  const startActualRecording = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Your browser does not support camera access");
      return;
    }

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: true })
          .then((stream) => {
            if (!videoRef.current) {
              toast.error("Video element not ready");
              return;
            }

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.play();

            setIsRecording(true);
            setTimer(0);

            startChunkRecording();
            chunkIntervalRef.current = setInterval(startChunkRecording, 20000);
            timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
          })
          .catch((err) => {
            console.error("getUserMedia error:", err);
            if (err.name === "NotAllowedError") {
              toast.error("Permission denied for camera/microphone.");
            } else if (err.name === "NotFoundError") {
              toast.error("No camera/microphone found.");
            } else {
              toast.error("Failed to access media devices.");
            }
          });
      },
    });
  };

  const handleStart = () => {
    if (doctor?.isVideoProcessing) {
      setShowProcessingDialog(true);
      return;
    }
    if (isRecording || countdown !== null) return;

    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      startActualRecording();
      return;
    }

    const countdownInterval = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(countdownInterval);
  }, [countdown]);

  const handleStop = () => {
    if (!isRecording) return;

    setIsRecording(false);
    clearInterval(chunkIntervalRef.current);
    clearInterval(timerRef.current);
    setTimer(0);

    try {
      if (activeRecorderRef.current?.state === "recording") {
        activeRecorderRef.current.stopFlag = true; // ✅ mark final chunk
        activeRecorderRef.current.stop();
        activeRecorderRef.current = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (err) {
      console.error("Stop recording cleanup failed:", err);
    }

    // ✅ No need to start a new recording — final chunk is already sent above

    // Show success popup after 10 seconds
    setTimeout(() => {
      setShowSuccessDialog(true);
      onVideoSuccess?.();
    }, 10000);
  };

  useEffect(() => {
    return () => {
      clearInterval(chunkIntervalRef.current);
      clearInterval(timerRef.current);
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.warn("Cleanup error on unmount:", err);
      }
    };
  }, []);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  // JSX omitted per request

  return (
    <>
      {!isVideoCompleted && (
        <div className="p-6 bg-gray-100 shadow rounded flex flex-col items-center relative">
          <div
            className="relative w-full max-w-[700px] mb-4 rounded-lg overflow-hidden shadow-md border border-gray-300"
            style={{
              maxHeight: "80vh",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain bg-black"
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-[8rem] font-extrabold animate-pulse drop-shadow-lg">
                  {countdown}
                </div>
              </div>
            )}
          </div>

          {doctor && (
            <div className="text-sm text-primary text-center mb-3">
              <div className="font-medium">{doctor.name}</div>
              <div className="text-xs">{doctor.topic}</div>
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <Button
              onClick={handleStart}
              disabled={
                isRecording || deleteMutation.isPending || countdown !== null
              }
              className="flex items-center justify-center w-32 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-medium rounded-lg py-2 px-4 hover:from-green-500 hover:via-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition-all"
            >
              <CirclePlay size={18} className="mr-2" />
              Start
            </Button>
            <Button
              onClick={handleStop}
              disabled={!isRecording}
              variant="destructive"
              className="flex items-center justify-center w-32 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white font-medium rounded-lg py-2 px-4 hover:from-red-500 hover:via-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 transition-all"
            >
              <CircleCheck size={18} className="mr-2" />
              Finish
            </Button>
          </div>

          {isRecording && (
            <div className="mt-4 font-bold text-lg">
              Timer: {formatTime(timer)}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Video Uploaded Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your recording has been uploaded and saved. Thank you for your
              submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showProcessingDialog}
        onOpenChange={setShowProcessingDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Video Upload In Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Please wait for the previous video to finish uploading before
              starting a new recording.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowProcessingDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default VideoRecorder;
