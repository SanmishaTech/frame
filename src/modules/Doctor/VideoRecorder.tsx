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
import { Smartphone, Monitor, CirclePlay, CircleStop } from "lucide-react";

function VideoRecorder({ uuid, doctor, onVideoSuccess, isVideoCompleted }) {
  const [orientation, setOrientation] = useState("portrait");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [frameColor, setFrameColor] = useState("#c0fbfd");
  const [countdown, setCountdown] = useState(0);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);

  const videoRef = useRef(null); // For camera stream
  const canvasRef = useRef(null); // For recording rotated
  const streamRef = useRef(null);
  const canvasStreamRef = useRef(null);
  const chunkIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const drawingIntervalRef = useRef(null);
  const activeRecorderRef = useRef(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/cleanup`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] }),
    onError: (e) => {
      console.error("Delete error:", e);
    },
  });

  const uploadChunkMutation = useMutation({
    mutationFn: (blob) => {
      const form = new FormData();
      form.append("video", blob, "chunk.webm");
      return axios.post(`${backendUrl}doctors/record/${uuid}`, form);
    },
    onError: () => {
      toast.error("Chunk upload failed");
    },
  });

  const finishMutation = useMutation({
    mutationFn: ({ orientation, frameColor }) =>
      axios.post(`${backendUrl}doctors/record/${uuid}/finish`, {
        orientation,
        frameColor,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] });
    },
    onError: () => {
      toast.error("Video merge failed");
    },
  });

  const startCanvasRecording = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const width = 720;
    const height = 1280;

    canvas.width = width;
    canvas.height = height;

    drawingIntervalRef.current = setInterval(() => {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((90 * Math.PI) / 180); // Rotate for portrait
      ctx.drawImage(video, -height / 2, -width / 2, height, width);
      ctx.restore();
    }, 30); // 30 FPS

    const canvasStream = canvas.captureStream(30);
    canvasStreamRef.current = canvasStream;

    const options = MediaRecorder.isTypeSupported("video/webm")
      ? { mimeType: "video/webm" }
      : {};

    let recorder;
    try {
      recorder = new MediaRecorder(canvasStream, options);
    } catch (err) {
      toast.error("Canvas recording not supported.");
      return;
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: "video/webm" });
        uploadChunkMutation.mutate(blob);
      } catch {
        toast.error("Failed to process canvas chunk");
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

  const startActualRecording = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Your browser does not support camera access");
      return;
    }

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: { facingMode: "user" },
          })
          .then((stream) => {
            streamRef.current = stream;

            if (!videoRef.current) {
              toast.error("Video element not ready");
              return;
            }

            videoRef.current.srcObject = stream;
            videoRef.current.play();

            setIsRecording(true);
            setTimer(0);

            setTimeout(() => {
              startCanvasRecording();
              chunkIntervalRef.current = setInterval(
                startCanvasRecording,
                3000
              );
              timerRef.current = setInterval(() => {
                setTimer((t) => t + 1);
              }, 1000);
            }, 500);
          })
          .catch((err) => {
            console.error("getUserMedia error:", err);
            toast.error("Camera access denied");
          });
      },
    });
  };

  const handleStart = () => {
    if (doctor.isVideoProcessing) {
      setShowProcessingDialog(true);
      return;
    }
    if (isRecording || countdown > 0) return;
    setCountdown(3);
  };

  const handleStop = () => {
    if (!isRecording) return;

    setIsRecording(false);
    clearInterval(chunkIntervalRef.current);
    clearInterval(timerRef.current);
    clearInterval(drawingIntervalRef.current);
    setTimer(0);

    try {
      if (
        activeRecorderRef.current &&
        activeRecorderRef.current.state === "recording"
      ) {
        activeRecorderRef.current.stop();
        activeRecorderRef.current = null;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      canvasStreamRef.current?.getTracks().forEach((track) => track.stop());

      videoRef.current.srcObject = null;
    } catch (err) {
      console.error("Stop recording cleanup failed:", err);
    }

    setTimeout(() => {
      finishMutation.mutate({ orientation, frameColor });
      setShowSuccessDialog(true);
      if (onVideoSuccess) onVideoSuccess();
    }, 2000);
  };

  useEffect(() => {
    if (countdown === 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          startActualRecording();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    return () => {
      clearInterval(chunkIntervalRef.current);
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  return (
    <>
      {!isVideoCompleted && (
        <div className="p-6 bg-slate-100 shadow rounded flex flex-col items-center relative">
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Frame Color
            </label>
            <div className="flex gap-3 w-full">
              {["#c0fbfd", "#f18bb9", "#ffede4", "#f2d9ef", "#fdf1c9"].map(
                (color) => {
                  const isSelected = frameColor === color;
                  return (
                    <div
                      key={color}
                      className={`flex-1 h-12 rounded-md ${
                        isSelected ? "border-2 border-black p-0.5" : ""
                      }`}
                    >
                      <button
                        onClick={() => setFrameColor(color)}
                        className="w-full h-full rounded-md transition"
                        style={{ backgroundColor: color }}
                        type="button"
                        disabled={isRecording}
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="mb-4 w-full border bg-muted p-1 rounded-md flex gap-1">
            <Button
              variant={orientation === "portrait" ? "default" : "ghost"}
              onClick={() => setOrientation("portrait")}
              disabled={isRecording}
              className="flex-1 flex items-center justify-center gap-2 text-sm"
            >
              <Smartphone size={16} />
              Mobile
            </Button>
            <Button
              variant={orientation === "landscape" ? "default" : "ghost"}
              onClick={() => setOrientation("landscape")}
              disabled={isRecording}
              className="flex-1 flex items-center justify-center gap-2 text-sm"
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
              style={{ display: "none" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {countdown > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-white text-6xl font-bold">{countdown}</div>
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
              disabled={isRecording || deleteMutation.isPending}
              variant="default"
              className="w-32 bg-green-600 hover:bg-green-700 text-white"
            >
              <CirclePlay size={18} />
              Start
            </Button>
            <Button
              onClick={handleStop}
              disabled={!isRecording || finishMutation.isPending}
              variant="destructive"
              className="w-32"
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
