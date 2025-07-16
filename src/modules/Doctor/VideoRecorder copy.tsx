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
function VideoRecorder({ uuid }) {
  const [orientation, setOrientation] = useState("portrait"); // portrait or landscape
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chunkIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const activeRecorderRef = useRef(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/delete`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] }),
    onError: (e) => {
      console.error("Delete error:", e);
      toast.error("Failed to delete previous video");
    },
  });

  const uploadChunkMutation = useMutation({
    mutationFn: (blob) => {
      const form = new FormData();
      form.append("video", blob, "chunk.webm");
      return axios.post(`${backendUrl}doctors/record/${uuid}`, form);
    },
    onSuccess: () => console.log("Chunk uploaded"),
    onError: (e) => {
      console.error("Chunk upload error:", e);
      toast.error("Chunk upload failed");
    },
  });

  const finishMutation = useMutation({
    mutationFn: ({ orientation }) =>
      axios.post(`${backendUrl}doctors/record/${uuid}/finish`, { orientation }),
    onSuccess: () => {
      toast.success("Video merged successfully");
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] });
    },
    onError: (e) => {
      console.error("Video merge error:", e);
      toast.error("Video merge failed");
    },
  });

  const startChunkRecording = () => {
    if (!streamRef.current) return;

    const options = MediaRecorder.isTypeSupported("video/webm")
      ? { mimeType: "video/webm" }
      : {};

    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, options);
    } catch (err) {
      console.error("Failed to create MediaRecorder:", err);
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
        uploadChunkMutation.mutate(blob);
      } catch (err) {
        console.error("Failed to upload chunk:", err);
        toast.error("Failed to process video chunk");
      }
    };

    recorder.start();
    activeRecorderRef.current = recorder;

    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
      if (activeRecorderRef.current === recorder) {
        activeRecorderRef.current = null;
      }
    }, 3000);
  };

  const handleStart = () => {
    if (isRecording) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Your browser does not support camera access");
      return;
    }

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        const videoConstraints =
          orientation === "portrait"
            ? {
                facingMode: "user",
                width: { ideal: 720 },
                height: { ideal: 1280 },
              }
            : {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              };

        navigator.mediaDevices
          .getUserMedia({ audio: true, video: videoConstraints })
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
            setProgressMessage("");

            startChunkRecording();
            chunkIntervalRef.current = setInterval(startChunkRecording, 3000);
            timerRef.current = setInterval(() => {
              setTimer((t) => t + 1);
            }, 1000);
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

  const handleStop = () => {
    if (!isRecording) return;

    setIsRecording(false);
    clearInterval(chunkIntervalRef.current);
    clearInterval(timerRef.current);
    setTimer(0);
    setProgressMessage("Processing video...");

    try {
      if (
        activeRecorderRef.current &&
        activeRecorderRef.current.state === "recording"
      ) {
        activeRecorderRef.current.stop();
        activeRecorderRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (err) {
            console.warn("Track stop failed:", err);
          }
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error("Stop recording cleanup failed:", err);
    }

    setTimeout(() => {
      finishMutation.mutate(
        { orientation },
        {
          onSettled: () => setProgressMessage(""),
        }
      );
    }, 500);
  };

  useEffect(() => {
    return () => {
      clearInterval(chunkIntervalRef.current);
      clearInterval(timerRef.current);

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        console.warn("Cleanup error on unmount:", err);
      }
    };
  }, []);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  useEffect(() => {
    const handleOrientation = () => {
      const o = window.orientation;
      if (o === 90 || o === -90) {
        toast.warning("Rotate your device to portrait mode");
      }
    };
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded flex flex-col items-center">
      {/* Orientation selector */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${
            orientation === "portrait"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setOrientation("portrait")}
          disabled={isRecording}
        >
          Portrait
        </button>
        <button
          className={`px-4 py-2 rounded ${
            orientation === "landscape"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setOrientation("landscape")}
          disabled={isRecording}
        >
          Landscape
        </button>
      </div>

      <div
        className={`relative w-full max-w-[400px] mb-4 rounded-lg overflow-hidden shadow-md border border-gray-300`}
        style={{
          aspectRatio: orientation === "portrait" ? "9 / 16" : "16 / 9",
          maxHeight: "80vh",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover bg-black"
          style={{ transform: "rotate(0deg)" }}
        />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg" />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={isRecording || deleteMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={() => {
            handleStop();
            setShowSuccessDialog(true);
          }}
          disabled={!isRecording || finishMutation.isPending}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Finish
        </button>
      </div>

      {isRecording && (
        <div className="mt-4 font-bold text-lg">Timer: {formatTime(timer)}</div>
      )}
      {progressMessage && (
        <div className="mt-4 font-semibold text-gray-700">
          {progressMessage}
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
    </div>
  );
}

export default VideoRecorder;
