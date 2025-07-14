import React from "react";
import DoctorForm from "./DoctorForm";

const EditDoctor = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Doctor</h1>
      <DoctorForm mode="edit" />
    </div>
  );
};

export default EditDoctor;
