import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BarChart2 } from "lucide-react";

// --- Step 1: Native Language Selection ---
const Step1 = ({ onContinue, data, onDataChange }) => {
  

  const languages = [
    { value: "english", label: "English", flag: "🇺🇸" },
    { value: "hindi", label: "Hindi", flag: "🇮🇳" },
    { value: "spanish", label: "Spanish", flag: "🇪🇸" },
    { value: "french", label: "French", flag: "🇫🇷" },
    { value: "german", label: "German", flag: "🇩🇪" },
  ];

  return (
    <>
      <div className="text-muted-foreground text-sm mb-2">
        The language you grew up talking at home.
      </div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        What's your native language?
      </h2>
      <div className="space-y-2">
        {languages.map((lang) => (
          <div
            key={lang.value}
            className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${
              data.nativeLanguage === lang.value
                ? "bg-accent"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onDataChange({ nativeLanguage: lang.value })}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="flex-1 font-medium">{lang.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <Button
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg w-full h-12 text-base"
          onClick={onContinue}
          disabled={!data.nativeLanguage}
        >
          Continue
        </Button>
      </div>
    </>
  );
};

const Step2 = ({ onContinue, onBack, data, onDataChange }) => {
  

  const languages = [
    { value: "English", label: "English", flag: "🇺🇸" },
    { value: "hi-IN", label: "Hindi", flag: "🇮🇳" },
    { value: "es-ES", label: "Spanish", flag: "🇪🇸" },
    { value: "fr-FR", label: "French", flag: "🇫🇷" },
    { value: "de-DE", label: "German", flag: "🇩🇪" },
  ];

  return (
    <>
      <div className="text-muted-foreground text-sm mb-2">
        The language you want to learn.
      </div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        What language do you want to learn?
      </h2>
      <div className="space-y-2">
        {languages.map((lang) => (
          <div
            key={lang.value}
            className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${
              data.targetLanguage === lang.value
                ? "bg-accent"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onDataChange({ targetLanguage: lang.value })}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="flex-1 font-medium">{lang.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-8 space-x-4">
        <Button
          variant={"outline"}
          className="flex-1 h-12 text-base"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg w-[50%] h-12 text-base"
          onClick={onContinue}
          disabled={!data.targetLanguage}
        >
          Continue
        </Button>
      </div>
    </>
  );
};

// --- Step 2: Name Input ---
const Step3 = ({ onContinue, onBack, data, onDataChange }) => {
  

  return (
    <>
      <div className="text-muted-foreground text-sm mb-2">
        We'll pass it on to your tutor.
      </div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        What's your name?
      </h2>
      <Input
        type="text"
        placeholder="Name"
        className="h-12 text-base bg-input"
        value={data.name}
        onChange={(e) => onDataChange({ name: e.target.value })}
      />
      <div className="flex justify-between mt-8 space-x-4">
        <Button
          variant="outline"
          className="flex-1 h-12 text-base"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg h-12 text-base"
          onClick={onContinue}
          disabled={!data.name}
        >
          Continue
        </Button>
      </div>
    </>
  );
};

// --- Step 3: Proficiency Level Selection ---
const Step4 = ({ onContinue, onBack, data, onDataChange }) => {
  
  const levels = [
    {
      id: "novice",
      title: "NOVICE",
      description: "I'm just starting to learn",
      icon: (
        <BarChart2
          size={32}
          className="text-muted-foreground/50 -rotate-90 scale-y-50"
        />
      ),
    },
    {
      id: "beginner",
      title: "BEGINNER",
      description:
        "I know some phrases and can have a short, basic conversation",
      icon: (
        <BarChart2
          size={32}
          className="text-muted-foreground/70 -rotate-90 scale-y-75"
        />
      ),
    },
    {
      id: "intermediate",
      title: "INTERMEDIATE",
      description: "I can handle routine conversations",
      icon: (
        <BarChart2 size={32} className="text-muted-foreground -rotate-90" />
      ),
    },
    {
      id: "advanced",
      title: "ADVANCED",
      description: "I can discuss complex topics",
      icon: (
        <BarChart2
          size={32}
          className="text-foreground -rotate-90 scale-y-125"
        />
      ),
    },
  ];

  const handleLanguage = (language) => {
      switch (language) {
        case "en-US":
          return "English";
        case "in-HI":
          return "Hindi";
        case "fr-FR":
          return "French";
        case "de-DE":
          return "German";
        case "es-ES":
          return "Spanish";  
        default:
          return "English";
      }
  }

  return (
    <>
      <div className="text-muted-foreground text-sm mb-2">
        We'll adjust your app experience based on your level.
      </div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        {`How proficient are you in ${handleLanguage(data.targetLanguage)}?`} 
      </h2>
      <RadioGroup
        onValueChange={(value) => onDataChange({ proficiencyLevel: value })}
        value={data.proficiencyLevel}
        className="space-y-2"
      >
        {levels.map((level) => (
          <div
            key={level.id}
            className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${
              data.proficiencyLevel === level.id ? "bg-accent" : "hover:bg-muted/50"
            }`}
            onClick={() => onDataChange({ proficiencyLevel: level.id })}
          >
            <RadioGroupItem value={level.id} className="sr-only" />
            <div>{level.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">
                {level.title}
              </p>
              <p className="text-muted-foreground text-sm">
                {level.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-between mt-8 space-x-4">
        <Button
          variant="outline"
          className="flex-1 h-12 text-base"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg h-12 text-base"
          onClick={onContinue}
          disabled={!data.proficiencyLevel}
        >
          Continue
        </Button>
      </div>
    </>
  );
};

// --- Step 4: Tutor Selection ---
const Step5 = ({onBack, data, onDataChange,onOnboardingComplete  }) => {
  

  const tutors = [
    {
      id: "en-US-alicia",
      name: "Alicia",
      gender: "Female",
      age: 27,
      flag: "English",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?&w=256&h=256&q=80",
    },
    {
      id: "hi-IN-ayushi",
      name: "Ayushi",
      gender: "Female",
      age: 34,
      flag: "Hindi",
      image:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?&w=256&h=256&q=80",
    },
    {
      id: "en-US-maverick",
      name: "Maverick",
      gender: "Male",
      age: 32,
      flag: "German",
      image:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?&w=256&h=256&q=80",
    },
    {
      id: "en-US-miles", 
      name: "Miles",
      gender: "Male",
      age: 30,
      flag: "Multinative",
      image:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?&w=256&h=256&q=80",
    },
  ];

  return (
    <>
      <div className="text-muted-foreground text-sm mb-2">
        You're almost ready to go!
      </div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        Pick your tutor to start your first lesson!
      </h2>
      <RadioGroup
        onValueChange={(value) => onDataChange({voiceModel: value}) }
        value={data.voiceModel}
        className="space-y-2"
      >
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${
              data.voiceModel === tutor.id ? "bg-accent" : "hover:bg-muted/50"
            }`}
            onClick={() => onDataChange({ voiceModel: tutor.id})}
          >
            <RadioGroupItem value={tutor.id} className="sr-only" />
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={tutor.image}
                alt={tutor.name}
                className={"object-cover"}
              />
              <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-lg flex items-center space-x-2">
                <span>{tutor.name}</span>
                <span className="text-sm">{tutor.flag}</span>
              </p>
              <p className="text-muted-foreground text-sm">
                {tutor.gender}, {tutor.age}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-between mt-8 space-x-4">
        <Button
          variant="outline"
          className="flex-1 h-12 text-base"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg h-12 text-base"
          onClick={onOnboardingComplete}
          disabled={!data.voiceModel}
        >
          Start Learning
        </Button>
      </div>
    </>
  );
};

// --- Main App Component ---
const OnboardingStep = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nativeLanguage: "",
    targetLanguage: "",
    proficiencyLevel: "",
    name: "",
    voiceModel: "",
  });

  const [localConfig, setLocalConfig] = useState({});

  const handleDataChange = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleFinalSubmit = () => {
    setLocalConfig(JSON.parse(localStorage.getItem("config")));
    localStorage.setItem("config", JSON.stringify(formData));
    console.log("Onboarding Complete", formData);
    //Pass the final data to the parent
    if(localConfig !== null){
        onOnboardingComplete(formData);
    }else{
        onOnboardingComplete(localConfig);
    }
  };

  

  

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            data={formData}
            onContinue={() => setStep(2)}
            onDataChange={handleDataChange}
          />
        );
      case 2:
        return (
          <Step2
            data={formData}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
            onDataChange={handleDataChange}
          />
        );
      case 3:
        return (
          <Step3
            data={formData}
            onContinue={() => setStep(4)}
            onBack={() => setStep(2)}
            onDataChange={handleDataChange}
          />
        );
      case 4:
        return (
          <Step4
            data={formData}
            onContinue={() => setStep(5)}
            onBack={() => setStep(3)}
            onDataChange={handleDataChange}
          />
        );
      case 5:
        return (
          <Step5
            data={formData}
            onBack={() => setStep(4)}
            onDataChange={handleDataChange}
            onOnboardingComplete={handleFinalSubmit}
          />
        );
      default:
        return null;
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="p-4 flex flex-col justify-center items-center rounded-xl">
      <div className="flex flex-col gap-4 w-full max-w-2xl px-8 py-10 rounded-3xl shadow-2xl backdrop-blur-md bg-card/80 border border-border z-50">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingStep;
