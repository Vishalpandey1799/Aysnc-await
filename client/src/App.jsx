import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SidebarPage from "./pages/SidebarPage";
import TalkingFrame from "./components/ChronicleGuide/ChronicleGuide";
import LanguageLearningPage from "./pages/LanguageLearningPage";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex  bg-neutral-900 min-h-screen">
        <Routes>
          <Route path="/" element={<SidebarPage />}>
            <Route index element={<TalkingFrame />} />
            <Route path="/learning" element={<LanguageLearningPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        {/* <ChronicleGuide /> */}
      </div>
    </BrowserRouter>
  );
};

export default App;
