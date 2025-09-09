import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { Link as LinkIcon } from "lucide-react";

const UserManual = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="font-sans dark:text-white leading-relaxed px-6 py-10 max-w-4xl mx-auto text-gray-800">
        <div className="flex justify-between">
          <h1 className="text-3xl dark:text-white font-bold text-gray-800 mb-6">
            Skincare Voices User Manual
          </h1>
          <Button onClick={() => navigate("/admin")}>Back</Button>
        </div>
        <p className="mb-6">
          This manual provides a step-by-step guide on how to use the{" "}
          <strong>Skincare Voices</strong> platform for managing doctors,
          inviting them to record videos, and viewing or downloading the
          recorded videos.
        </p>

        {/* Section 1 */}
        <h2
          onClick={() => navigate("/help/user-manual/page-1")}
          className="flex items-center gap-2 cursor-pointer text-indigo-600 text-2xl font-semibold border-b-2 border-indigo-500 pb-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          role="link"
        >
          <LinkIcon className="w-5 h-5" />
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

        {/* Section 2 */}
        <h2
          onClick={() => navigate("/help/user-manual/page-2")}
          className="flex items-center gap-2 cursor-pointer text-indigo-600 text-2xl font-semibold border-b-2 border-indigo-500 pb-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          role="link"
        >
          <LinkIcon className="w-5 h-5" />
          2. Adding a New Doctor
        </h2>
        <ol className="list-decimal list-inside space-y-3 mb-6">
          <li>
            After logging in, click on the <strong>Doctors</strong> tab in the
            left-hand navigation menu.
          </li>
          <li>
            On the "Doctor Management" page, click the{" "}
            <strong>Add Profile</strong> button in the top right corner.
          </li>
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
          <li>
            Once all the fields are filled, click the{" "}
            <strong>Create Doctor</strong> button. A "Doctor created
            successfully" message will appear, and the new doctor's profile will
            be added to the list.
          </li>
        </ol>

        {/* Section 3 */}
        <h2
          onClick={() => navigate("/help/user-manual/page-3")}
          className="flex items-center gap-2 cursor-pointer text-indigo-600 text-2xl font-semibold border-b-2 border-indigo-500 pb-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          role="link"
        >
          <LinkIcon className="w-5 h-5" />
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
          <li>
            A "Email send to doctor successfully" message will appear. This
            sends an email to the doctor with a unique link to their video
            recording page.
          </li>
        </ol>

        {/* Section 4 */}
        <h2
          onClick={() => navigate("/help/user-manual/page-4")}
          className="flex items-center gap-2 cursor-pointer text-indigo-600 text-2xl font-semibold border-b-2 border-indigo-500 pb-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          role="link"
        >
          <LinkIcon className="w-5 h-5" />
          4. Doctor's Workflow (Recording and Submitting the Video)
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            The doctor receives an email with the subject "Doctor Information
            Request".
          </li>
          <li>
            They click on the "Go to your recording page" button in the email.
          </li>
          <li>
            On the recording page, they will see instructions and a video
            player.
          </li>
          <li>
            They click the <strong>Start</strong> button to begin the recording
            process. A 5-second countdown will initiate.
          </li>
          <li>
            A pop-up will appear requesting permission to access their camera
            and microphone. The doctor must click <strong>Allow</strong>.
          </li>
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
        </ol>

        {/* Section 5 */}
        <h2
          onClick={() => navigate("/help/user-manual/page-5")}
          className="flex items-center gap-2 cursor-pointer text-indigo-600 text-2xl font-semibold border-b-2 border-indigo-500 pb-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          role="link"
        >
          <LinkIcon className="w-5 h-5" />
          5. Viewing and Downloading a Recorded Video (Doctor)
        </h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>
            After the recording is completed, the doctor will receive a new
            email with the subject "Video Information".
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
        </ol>

        {/* Section 6 */}
        <h2
          onClick={() => navigate("/help/user-manual/page-6")}
          className="flex items-center gap-2 cursor-pointer text-indigo-600 text-2xl font-semibold border-b-2 border-indigo-500 pb-1 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          role="link"
        >
          <LinkIcon className="w-5 h-5" />
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
          <li>
            A pop-up window titled "Doctor Video" will appear. You can watch the
            video directly in this window.
          </li>
          <li>
            To download the video file, click the <strong>Download</strong>{" "}
            button at the bottom of the pop-up. The video will be saved to your
            device.
          </li>
          <li>
            Click <strong>Close</strong> to close the video player.
          </li>
        </ol>
      </div>
    </>
  );
};

export default UserManual;
