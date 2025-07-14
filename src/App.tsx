import { useEffect } from "react";
import { appName } from "./config"; // Import appName from config
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import Login from "./modules/Auth/Login";
import Register from "./modules/Auth/Register";
import ForgotPassword from "./modules/Auth/ForgotPassword";
import ResetPassword from "./modules/Auth/ResetPassword";

import ProtectedRoute from "./components/common/protected-route"; // Correct path

import Dashboard from "./modules/Dashboard/DashboardPage";

import ProfilePage from "./modules/Profile/ProfilePage";

import UserList from "@/modules/User/UserList";

import { Toaster } from "sonner";
import "./App.css";

import DoctorList from "./modules/Doctor/DoctorList";
import CreateDoctor from "./modules/Doctor/CreateDoctor";
import EditDoctor from "./modules/Doctor/EditDoctor";
import PublicDoctorPage from "./modules/Doctor/PublicDoctorPage";
import GuestRoute from "./components/common/guest-route";

const App = () => {
  useEffect(() => {
    document.title = appName; // Set the document title
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route
              path="/"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            {/* <Route path="/register" element={<Register />} /> */}
            {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
            {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}
            {/* Add other auth routes here */}
          </Route>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <DoctorList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors/create"
              element={
                <ProtectedRoute>
                  <CreateDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors/:id/edit"
              element={
                <ProtectedRoute>
                  <EditDoctor />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/doctors/record/:uuid"
            element={
              <GuestRoute>
                <PublicDoctorPage />
              </GuestRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
