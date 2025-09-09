import React from "react";
import playVideo from "../../../assets/UserManualImages/playVideo.png";
import videoPopup from "../../../assets/UserManualImages/videoPopup.png";
import videoDownloadButton from "../../../assets/UserManualImages/videoDownloadButton.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

const UserManualPage6 = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="font-sans leading-relaxed dark:text-white px-6 py-10 max-w-4xl mx-auto text-gray-800">
        <div className="flex justify-between">
          <h1 className="text-3xl dark:text-white font-bold text-gray-800 mb-6">
            Skincare Voices User Manual
          </h1>
          <Button onClick={() => navigate("/help/user-manual")}>Back</Button>
        </div>

        <p className="mb-6">
          This manual provides a step-by-step guide on how to use the{" "}
          <strong>Skincare Voices</strong> platform for managing doctors,
          inviting them to record videos, and viewing or downloading the
          recorded videos.
        </p>

        {/* Section 6 */}
        <h2 className="cursor-pointer dark:text-white text-2xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4 hover:text-indigo-600 transition-colors duration-200">
          6. Viewing and Downloading a Recorded Video (Admin)
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            Log back into the admin panel and navigate to the{" "}
            <strong>Doctors</strong> tab.
          </li>
          <li>Locate the doctor whose video you want to view.</li>
          <li>
            In the <strong>Actions</strong> column for that doctor, click the{" "}
            <strong>Play Video</strong> button (the play icon).
          </li>
          <img src={playVideo} alt="playVideo" />

          <li>
            A pop-up window titled "Doctor Video" will appear. You can watch the
            video directly in this window.
          </li>
          <img src={videoPopup} alt="videoPopup" />

          <li>
            To download the video file, click the <strong>Download</strong>{" "}
            button at the bottom of the pop-up. The video will be saved to your
            device.
          </li>
          <img src={videoDownloadButton} alt="videoDownloadButton" />

          <li>
            Click <strong>Close</strong> to close the video player.
          </li>
        </ol>
      </div>
    </>
  );
};

export default UserManualPage6;
