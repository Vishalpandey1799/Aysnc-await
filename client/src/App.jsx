import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SidebarPage from "./pages/SidebarPage";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex bg-neutral-900 min-h-screen">
        <Routes>
          <Route path="/" element={<SidebarPage />}>
            <Route index element={<HomePage />} />

            {/* 404 route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
