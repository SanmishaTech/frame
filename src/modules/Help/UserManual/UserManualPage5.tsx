import React from "react";
import successEmail from "../../../assets/UserManualImages/successEmail.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

const UserManualPage5 = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="font-sans dark:text-white leading-relaxed px-6 py-10 max-w-4xl mx-auto text-gray-800">
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

        {/* Section 5 */}
        <h2 className="cursor-pointer dark:text-white text-2xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4 hover:text-indigo-600 transition-colors duration-200">
          5. Viewing and Downloading a Recorded Video (Doctor)
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            After the recording is completed, the doctor will receive a new
            email with the subject "Video Uploaded Successfully".
          </li>
          <li>
            This email will contain two buttons:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>
                <strong>View your video:</strong> Click this button to view the
                recorded video.
              </li>
              <li>
                <strong>Record another video:</strong> Click this if you are not
                satisfied with the uploaded video and want to record a new one.
              </li>
            </ul>
          </li>
          <li>
            When viewing the video, locate the three-dot menu (...) on the
            bottom right of the video player.
          </li>
          <li>
            Click the three-dot menu and select the <strong>Download</strong>{" "}
            option to save the video to your device.
          </li>
          <img src={successEmail} alt="successEmail" />
        </ol>
      </div>
    </>
  );
};

export default UserManualPage5;
