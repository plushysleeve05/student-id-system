import React from "react";
import RegistrationForm from "./RegistrationForm";

const RegistrationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegistrationPage;
