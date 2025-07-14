import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backendUrl } from "@/config";
import axios from "axios";
import ConfirmDialog from "@/components/common/confirm-dialog";

function VideoRecorder({ uuid }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const queryClient = useQueryClient();

  // Deletion mutation
  const deleteVideoMutation = useMutation({
    mutationFn: (uuid) =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/delete`),
    onSuccess: () => {
      toast.success("Video deleted successfully");
      queryClient.invalidateQueries(["videos"]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete video");
    },
  });

  // Finish upload mutation
  const finishUploadMutation = useMutation({
    mutationFn: (uuid) =>
      axios.post(`${backendUrl}doctors/record/${uuid}/finish`),
    onSuccess: () => {
      toast.success("Video uploaded successfully");
      setProgressMessage("Video Uploaded.");
    },
    onError: (error) => {
      toast.error(error?.message || "Error uploading video");
      setProgressMessage("Error uploading video.");
    },
  });

  // Start recording
  const startRecordingStream = async () => {
    setIsRecording(true);
    setProgressMessage("");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const formData = new FormData();
        formData.append("video", event.data, "video.webm");

        try {
          await axios.post(`${backendUrl}doctors/record/${uuid}`, formData);
          console.log("✅ Chunk uploaded");
        } catch (error) {
          console.error("❌ Error uploading chunk:", error);
          toast.error("Chunk upload failed");
        }
      }
    };

    mediaRecorderRef.current.start(3000); // chunk every 3 sec

    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording
  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());

    clearInterval(timerRef.current);
    setTimer(0);
    setProgressMessage("Processing video...");

    // Mark upload finished
    finishUploadMutation.mutate(uuid);
  };

  // Start recording after deletion
  const handleStartRecording = () => {
    deleteVideoMutation.mutate(uuid, {
      onSuccess: () => {
        startRecordingStream();
      },
      onError: (error) => {
        toast.error(
          "Failed to delete previous video. Cannot start new recording."
        );
        console.error("❌ Delete error:", error);
      },
    });
  };

  // Confirm delete dialog
  const confirmDelete = () => {
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    deleteVideoMutation.mutate(uuid);
    setShowConfirmation(false);
  };

  // Timer formatter
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Video Recorder</h2>
      <video
        ref={videoRef}
        autoPlay
        className="w-full h-64 bg-black mb-4"
      ></video>
      <div className="flex gap-4">
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Finish
        </button>
        <button
          onClick={confirmDelete}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Delete Video
        </button>
      </div>
      {isRecording && (
        <div className="mt-4 text-xl font-bold">Timer: {formatTime(timer)}</div>
      )}
      {progressMessage && (
        <div className="mt-4 text-xl font-bold">{progressMessage}</div>
      )}

      <ConfirmDialog
        isOpen={showConfirmation}
        title="Confirm Deletion"
        description="Are you sure you want to delete this video? This action cannot be undone."
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default VideoRecorder;
