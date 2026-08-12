"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: "",
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
        },

        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: "#541822",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#541822",
          },
        },
        error: {
          duration: 5000,
          style: {
            background: "#7a2630",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#7a2630",
          },
        },
        loading: {
          style: {
            background: "#541822",
            color: "#fff",
          },
        },
      }}
    />
  );
}
