import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backendUrl } from "@/config";

function VideoRecorder({ uuid }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chunkIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const activeRecorderRef = useRef(null); // ✅ Track active recorder

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/delete`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] }),
    onError: () => toast.error("Failed to delete previous video"),
  });

  const uploadChunkMutation = useMutation({
    mutationFn: (blob) => {
      const form = new FormData();
      form.append("video", blob, "chunk.webm");
      return axios.post(`${backendUrl}doctors/record/${uuid}`, form);
    },
    onSuccess: () => console.log("Chunk uploaded"),
    onError: () => toast.error("Chunk upload failed"),
  });

  const finishMutation = useMutation({
    mutationFn: () => axios.post(`${backendUrl}doctors/record/${uuid}/finish`),
    onSuccess: () => {
      toast.success("Video merged successfully");
      queryClient.invalidateQueries({ queryKey: ["doctor", uuid] });
    },
    onError: () => toast.error("Video merge failed"),
  });

  const startChunkRecording = () => {
    const options = MediaRecorder.isTypeSupported("video/webm")
      ? { mimeType: "video/webm" }
      : {};

    const recorder = new MediaRecorder(streamRef.current, options);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      uploadChunkMutation.mutate(blob);
    };

    recorder.start();
    activeRecorderRef.current = recorder; // ✅ Store the currently active recorder

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
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
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
          .catch(() => toast.error("Camera/Mic access denied"));
      },
    });
  };

  const handleStop = () => {
    setIsRecording(false);
    clearInterval(chunkIntervalRef.current);
    clearInterval(timerRef.current);
    setTimer(0);
    setProgressMessage("Processing video...");

    // ✅ Stop active recorder if still recording
    if (
      activeRecorderRef.current &&
      activeRecorderRef.current.state === "recording"
    ) {
      activeRecorderRef.current.stop();
      activeRecorderRef.current = null;
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    videoRef.current.srcObject = null;

    // ✅ Delay finish until last chunk is uploaded
    setTimeout(() => {
      finishMutation.mutate(undefined, {
        onSettled: () => setProgressMessage(""),
      });
    }, 500);
  };

  useEffect(() => {
    return () => {
      clearInterval(chunkIntervalRef.current);
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  return (
    <div className="p-6 bg-white shadow rounded">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-64 bg-black mb-4"
      />
      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={isRecording || deleteMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!isRecording || finishMutation.isPending}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Finish
        </button>
      </div>
      {isRecording && (
        <div className="mt-4 font-bold">Timer: {formatTime(timer)}</div>
      )}
      {progressMessage && (
        <div className="mt-4 font-bold">{progressMessage}</div>
      )}
    </div>
  );
}

export default VideoRecorder;
