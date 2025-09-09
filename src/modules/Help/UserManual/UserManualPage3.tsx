import React from "react";
import loginPage from "../../../assets/UserManualImages/loginPage.png";
sendInvite;
import dashboardPage from "../../../assets/UserManualImages/dashboardPage.png";
import sendInvite from "../../../assets/UserManualImages/sendInvite.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

const UserManualPage3 = () => {
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

        {/* Section 3 */}
        <h2 className="text-2xl dark:text-white font-semibold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4">
          3. Inviting a Doctor to Record a Video
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            In the "Doctor Management" list, locate the doctor you wish to
            invite.
          </li>
          <li>
            In the <strong>Actions</strong> column for that doctor, click the{" "}
            <strong>Send Invite</strong> button (the envelope icon).
          </li>
          <img src={sendInvite} alt="sendInvite" />

          <li>
            A "Email send to doctor successfully" message will appear. This
            sends an email to the doctor with a unique link to their video
            recording page.
          </li>
        </ol>
      </div>
    </>
  );
};

export default UserManualPage3;
