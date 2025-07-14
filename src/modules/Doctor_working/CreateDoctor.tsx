import React from "react";
import DoctorForm from "./DoctorForm";

const CreateDoctor = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Doctor</h1>
      <DoctorForm mode="create" />
    </div>
  );
};

export default CreateDoctor;
