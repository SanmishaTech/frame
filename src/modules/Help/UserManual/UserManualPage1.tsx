import React from "react";
import loginPage from "../../../assets/UserManualImages/loginPage.png";
import dashboardPage from "../../../assets/UserManualImages/dashboardPage.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
const UserManualPage1 = () => {
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

        {/* Section 1 */}
        <h2 className="text-2xl dark:text-white font-semibold text-gray-700 border-b-2 border-gray-300 pb-1 mb-4">
          1. Logging In to the Admin Panel
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            Open your web browser and navigate to the admin login page:{" "}
            <code className="bg-gray-100 text-blue-600 px-1 py-0.5 rounded">
              https://skincarevoices.com/admin
            </code>
          </li>
          <li>
            Enter your <strong>Email</strong> and <strong>Password</strong> in
            the provided fields.
          </li>
          <li>
            Click the <strong>Login</strong> button to access the dashboard.
          </li>
        </ol>

        <img src={loginPage} alt="Login Page" />

        <img src={dashboardPage} alt="Dashboard Page" />
      </div>
    </>
  );
};

export default UserManualPage1;
