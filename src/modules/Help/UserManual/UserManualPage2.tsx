import React from "react";
import loginPage from "../../../assets/UserManualImages/loginPage.png";
import dashboardPage from "../../../assets/UserManualImages/dashboardPage.png";
import doctorMarkImage from "../../../assets/UserManualImages/doctorMarkImage.png";
import ClickAddProfile from "../../../assets/UserManualImages/ClickAddProfile.png";
import CreateDoctor from "../../../assets/UserManualImages/CreateDoctor.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

const UserManualPage2 = () => {
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

        {/* Section 2 */}
        <h2 className="text-2xl dark:text-white font-semibold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4">
          2. Adding a New Doctor
        </h2>
        <ol className="list-decimal list-inside space-y-3 mb-6">
          <li>
            After logging in, click on the <strong>Doctors</strong> tab in the
            left-hand navigation menu.
          </li>

          <img src={doctorMarkImage} alt="doctorMarkImage" />

          <li>
            On the "Doctor Management" page, click the{" "}
            <strong>Add Profile</strong> button in the top right corner.
          </li>
          <img src={ClickAddProfile} alt="ClickAddProfile" />

          <li>
            Fill out the "Create Doctor" form with the following information:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>
                <strong>Name:</strong> The doctor's full name{" "}
                <em>
                  (please include "Dr." as a prefix, e.g., Dr. Rohit Vijay
                  Kulkarni)
                </em>
                .
              </li>
              <li>
                <strong>Email:</strong> The doctor's email address.
              </li>
              <li>
                <strong>Mobile:</strong> The doctor's 10-digit mobile number.
              </li>
              <li>
                <strong>City:</strong> The city where the doctor practices.
              </li>
              <li>
                <strong>Degree:</strong> The doctor's academic degree (e.g.,
                MBBS, MD).
              </li>
              <li>
                <strong>Specialty:</strong> The doctor's medical specialty
                (e.g., Cardiologist, Dermatologist).
              </li>
              <li>
                <strong>Topic:</strong> The topic for which the doctor will be
                recording a video (e.g., "Advances in heart disease treatment").
              </li>
            </ul>
          </li>
          <img src={CreateDoctor} alt="CreateDoctor" />

          <li>
            Once all the fields are filled, click the{" "}
            <strong>Create Doctor</strong> button. A "Doctor created
            successfully" message will appear, and the new doctor's profile will
            be added to the list.
          </li>
        </ol>
      </div>
    </>
  );
};

export default UserManualPage2;
