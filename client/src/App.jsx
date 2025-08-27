import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SidebarPage from "./pages/SidebarPage";
import HomePage from "./pages/HomePage";
import LanguageLearningApp from "./service/Duolingo";
import ChronicleGuide from "./components/ChronicleGuide/ChronicleGuide";
import LanguageLearningApp from "./service/Duolingo";
import LanguageLearningApp from "./service/Duolingo";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex bg-neutral-900 min-h-screen">
        <Routes>
          <Route path="/" element={<SidebarPage />}>
            <Route index element={<HomePage />} />
            <Route path='/ling' element={<LanguageLearningApp/>}/>

            {/* 404 route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        <ChronicleGuide />
      </div>
    </BrowserRouter>
  );
};

export default App;
