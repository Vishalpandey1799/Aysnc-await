import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SidebarPage from "./pages/SidebarPage";
import TalkingFrame from "./components/ChronicleGuide/ChronicleGuide";
import LanguageLearningPage from "./pages/LanguageLearningPage";
import HomePage from "./components/HomePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page (no flex wrapper) */}
        <Route path="/" element={<HomePage />} />

        {/* Sidebar Layout (with flex wrapper inside SidebarPage itself) */}
        <Route path="/app" element={<SidebarPage />}>
          <Route index element={<TalkingFrame />} />
          <Route path="learning" element={<LanguageLearningPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
