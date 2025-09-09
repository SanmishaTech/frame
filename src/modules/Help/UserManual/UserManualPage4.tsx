import React from "react";
import DoctorRequestEmail from "../../../assets/UserManualImages/DoctorRequestEmail.png";
import permission from "../../../assets/UserManualImages/permission.png";
import videoUploadPopup from "../../../assets/UserManualImages/videoUploadPopup.png";
import doctorPublicPage1 from "../../../assets/UserManualImages/doctorPublicPage1.png";
import doctorPublicPage2 from "../../../assets/UserManualImages/doctorPublicPage2.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

const UserManualPage4 = () => {
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

        {/* Section 4 */}
        <h2 className="cursor-pointer dark:text-white text-2xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4 hover:text-indigo-600 transition-colors duration-200">
          4. Doctor's Workflow (Recording and Submitting the Video)
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            The doctor receives an email with the subject "Doctor Information
            Request".
          </li>
          <li>
            Then click on the "Go to your recording page" button in the email.
          </li>
          <img src={DoctorRequestEmail} alt="DoctorRequestEmail" />

          <li>
            On the recording page, they will see instructions and a video
            player.
          </li>
          <img src={doctorPublicPage1} alt="doctorPublicPage1" />
          <img src={doctorPublicPage2} alt="doctorPublicPage2" />

          <li>
            They click the <strong>Start</strong> button to begin the recording
            process. A 5-second countdown will initiate.
          </li>
          <li>
            A pop-up will appear requesting permission to access their camera
            and microphone. The doctor must click <strong>Allow</strong>.
          </li>
          <img src={permission} alt="permission" />

          <li>The video recording begins.</li>
          <li>
            Once the video is complete, the doctor clicks the{" "}
            <strong>Finish</strong> button.
          </li>
          <li>
            A "Video Uploaded Successfully" pop-up will confirm that the video
            has been submitted. The doctor can then click <strong>Close</strong>{" "}
            to exit.
          </li>
          <img src={videoUploadPopup} alt="videoUploadPopup" />
        </ol>
      </div>
    </>
  );
};

export default UserManualPage4;
