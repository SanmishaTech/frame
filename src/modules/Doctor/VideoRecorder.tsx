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
import {
  Smartphone,
  Monitor,
  CirclePlay,
  CircleStop,
  Clock,
} from "lucide-react";
function VideoRecorder({ uuid, doctor, onVideoSuccess, isVideoCompleted }) {
  const [orientation, setOrientation] = useState("portrait"); // portrait or landscape
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
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
      // console.error("Delete error:", e);
      toast.error("Failed to delete previous video");
    },
  });

  const uploadChunkMutation = useMutation({
    mutationFn: (blob) => {
      const form = new FormData();
      form.append("video", blob, "chunk.webm");
      return axios.post(`${backendUrl}doctors/record/${uuid}`, form);
    },
    onError: (e) => {
      // console.error("Chunk upload error:", e);
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
      // console.error("Video merge error:", e);
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
      // console.error("Failed to create MediaRecorder:", err);
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
        // console.error("Failed to upload chunk:", err);
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
        // No orientation-based constraints here, just default
        const videoConstraints = {
          facingMode: "user",
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
      finishMutation.mutate({ orientation });
      setShowSuccessDialog(true);
      if (onVideoSuccess) onVideoSuccess(); // <-- callback triggers the parent
    }, 2000);
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
    <>
      {!isVideoCompleted ? (
        <>
          <div className="p-6 bg-slate-100 shadow rounded flex flex-col items-center">
            {/* Orientation selector */}
            <div className="mb-4 w-full bg-muted p-1 rounded-md flex gap-1">
              <Button
                variant={orientation === "portrait" ? "default" : "ghost"}
                onClick={() => setOrientation("portrait")}
                disabled={isRecording}
                className="flex-1 flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm"
              >
                <Smartphone size={16} />
                Mobile
              </Button>
              <Button
                variant={orientation === "landscape" ? "default" : "ghost"}
                onClick={() => setOrientation("landscape")}
                disabled={isRecording}
                className="flex-1 flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm"
              >
                <Monitor size={16} />
                Desktop
              </Button>
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

            {doctor && (
              <div className="text-sm text-primary text-center mb-3">
                <div className="font-medium">Dr. {doctor.name}</div>
                <div className="text-xs">Topic: {doctor.topic}</div>
              </div>
            )}

            <div className="flex gap-4 mt-2">
              <Button
                onClick={handleStart}
                disabled={isRecording || deleteMutation.isPending}
                variant="default"
                className="w-32 bg-green-600 hover:bg-green-700 text-white px-5 py-2 flex items-center justify-center gap-2"
              >
                <CirclePlay size={18} />
                Start
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isRecording || finishMutation.isPending}
                variant="destructive"
                className="w-32 px-5 py-2 flex items-center justify-center gap-2"
              >
                <CircleStop size={18} />
                Finish
              </Button>
            </div>

            {isRecording && (
              <div className="mt-4 font-bold text-lg">
                Timer: {formatTime(timer)}
              </div>
            )}
          </div>
        </>
      ) : (
        ""
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
    </>
  );
}

export default VideoRecorder;
