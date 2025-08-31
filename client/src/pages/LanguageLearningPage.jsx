import React, { useEffect, useState } from "react";
import OnboardingStep from "@/components/languageTutor/Onboarding";
import LanguageLearninApp from "@/service/Learning";
const LanguageLearningPage = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [sessionConfig, setSessionConfig] = useState(null);

   useEffect(() => {
      if(JSON.parse(localStorage.getItem("config")) !== null) {
         setIsOnboarding(false);
      }
   },[sessionConfig])
  const handleOnboardingComplete = (data) => {
    
    setSessionConfig(data);
    setIsOnboarding(false);
    
  };

  if (isOnboarding) {
    return <OnboardingStep onOnboardingComplete={handleOnboardingComplete} />;
  }

  return <LanguageLearninApp />;
};

export default LanguageLearningPage;
