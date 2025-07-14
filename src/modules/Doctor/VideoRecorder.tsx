import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backendUrl } from "@/config";
import axios from "axios";
import ConfirmDialog from "@/components/common/confirm-dialog";

function VideoRecorder({ uuid, doctor }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const recordedChunks = useRef([]);
  const queryClient = useQueryClient();

  // Delete previous video
  const deleteVideoMutation = useMutation({
    mutationFn: (uuid) =>
      axios.delete(`${backendUrl}doctors/record/${uuid}/delete`),
    onSuccess: () => {
      toast.success("Previous video deleted");
      queryClient.invalidateQueries(["doctor", uuid]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete video");
    },
  });

  // // Start recording
  // const startRecordingStream = async () => {
  //   setIsRecording(true);
  //   setProgressMessage("");
  //   recordedChunks.current = [];

  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true,
  //   });
  //   videoRef.current.srcObject = stream;

  //   mediaRecorderRef.current = new MediaRecorder(stream, {
  //     mimeType: "video/webm",
  //   });

  //   mediaRecorderRef.current.ondataavailable = (event) => {
  //     if (event.data.size > 0) {
  //       recordedChunks.current.push(event.data);
  //     }
  //   };

  //   mediaRecorderRef.current.start(); // no timeslice: gather all data

  //   timerRef.current = setInterval(() => {
  //     setTimer((prev) => prev + 1);
  //   }, 1000);
  // };
  const startRecordingStream = async () => {
    // ✅ Check browser support for MediaRecorder and WebM format
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported("video/webm")) {
      toast.error("Your browser doesn't support video recording with WebM.");
      return;
    }
    try {
      setIsRecording(true);
      setProgressMessage("");
      recordedChunks.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!MediaRecorder) {
        toast.error("MediaRecorder is not supported in this browser.");
        return;
      }
      videoRef.current.srcObject = stream;

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Failed to access camera or microphone.");
      setIsRecording(false);
      setProgressMessage("");
      console.error("❌ Error starting recording:", error);
    }
  };

  // Stop recording and upload
  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    setProgressMessage("Processing video...");

    mediaRecorderRef.current.stop();
    // videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    clearInterval(timerRef.current);
    setTimer(0);

    // Wait for recorder to finish emitting data
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });

      const formData = new FormData();
      formData.append("video", blob, "recorded.webm");

      try {
        await axios.post(`${backendUrl}doctors/record/${uuid}`, formData);
        toast.success("Video uploaded successfully");
        setProgressMessage("Video uploaded successfully");
      } catch (error) {
        console.error("❌ Upload error:", error);
        toast.error("Video upload failed");
        setProgressMessage("Video upload failed");
      }
    };
  };

  // Start recording after deleting previous
  const handleStartRecording = () => {
    deleteVideoMutation.mutate(uuid, {
      onSuccess: startRecordingStream,
      onError: (error) => {
        toast.error(
          "Failed to delete previous video. Cannot start new recording."
        );
        console.error("❌ Delete error:", error);
      },
    });
  };

  // Confirm delete
  const confirmDelete = () => {
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    deleteVideoMutation.mutate(uuid);
    setShowConfirmation(false);
  };

  // Timer format
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log("Available media devices:", devices);
    });

    return () => {
      clearInterval(timerRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="">
      <video
        ref={videoRef}
        autoPlay
        muted
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
        {doctor?.filepath && doctor?.filepath.length > 0 ? (
          <button
            onClick={confirmDelete}
            disabled={isRecording}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Delete Video
          </button>
        ) : null}
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
