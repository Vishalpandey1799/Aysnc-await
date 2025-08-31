import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CameraIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const MessageSquareIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const XIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-20 py-6 px-4 md:px-8">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white tracking-wider">
        async await
      </h1>
      <nav className="hidden md:flex items-center space-x-8">
        <a
          href="#features"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Features
        </a>
      </nav>
    </div>
  </header>
);

const HeroSection = ({ navigate }) => (
  <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-gray-900 text-white px-4">
    <div className="absolute inset-0 z-0">
      <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-[-20%] top-[20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]"></div>
      <div className="animate-pulse-slow absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
      <div className="animate-pulse-slow-delay absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
    </div>
    <div className="relative z-10 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          See Your World, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Master Your Words.
          </span>
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Instantly understand your surroundings with our visual narrator, and
          become fluent faster with an AI-powered language tutor.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-colors duration-300 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:from-purple-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          onClick={() => navigate("/app")}
        >
          Get Started Free
          <ArrowRightIcon className="w-6 h-6 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
  >
    <div className="mb-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center rounded-xl text-white">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-32 bg-gray-900 text-white px-4">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0.5, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Two Powerful Tools. One Vision.
        </h2>
        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
          Whether you're exploring a new city or a new language, we've got you
          covered.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <FeatureCard
          icon={<CameraIcon className="w-8 h-8" />}
          title="Visual Narrator"
          description="Point your camera at any object and tap to get an instant audio description. Perfect for travel, learning, and satisfying your curiosity."
        />
        <FeatureCard
          icon={<MessageSquareIcon className="w-8 h-8" />}
          title="Language Tutor"
          description="Practice conversations, perfect your pronunciation, and learn grammar with a friendly AI tutor that's available 24/7. Your journey to fluency starts here."
        />
      </div>
    </div>
  </section>
);

const CTASection = ({ navigate }) => (
  <section className="py-20 bg-gray-900 px-4">
    <div className="container mx-auto text-center max-w-4xl">
      <motion.div
        initial={{ opacity: 0.5, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-white">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-lg text-gray-400 mt-4 mb-8">
          Join thousands of users who are seeing the world and their words in a
          whole new way.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-colors duration-300 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:from-purple-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          onClick={() => navigate("/app")}
        >
          Start Your Journey Now
          <ArrowRightIcon className="w-6 h-6 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </div>
  </section>
);

const DeveloperCard = ({ name, imageUrl, githubUrl, xUrl }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
    className="group relative p-1 rounded-2xl bg-gradient-to-br from-purple-500/50 via-slate-900 to-blue-500/50 transition-all duration-300 hover:!opacity-100"
  >
    <div className="relative z-10 p-8 rounded-[15px] bg-slate-900 h-full flex flex-col items-center text-center">
      <div className="absolute top-0 left-0 h-full w-full bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cpath%20d%3D%22M0%2025%20L100%2025%20M25%200%20L25%20100%20M50%200%20L50%20100%20M75%200%20L75%20100%20M0%2050%20L100%2050%20M0%2075%20L100%2075%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%20%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>

      <motion.div className="absolute -inset-2 rounded-xl bg-purple-500/30 blur-xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      <motion.img
        src={imageUrl}
        alt={`${name}'s profile picture`}
        className="relative z-10 w-28 h-28 rounded-full mb-5 border-2 border-slate-700/50"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      />
      <h3 className="relative z-10 text-2xl font-bold text-white mb-1">
        {name}
      </h3>
      <p className="relative z-10 text-purple-400/80 mb-6">Co-founder</p>

      <div className="relative z-10 flex justify-center items-center space-x-5 mt-auto pt-4">
        <motion.a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white"
          whileHover={{ scale: 1.2, y: -2 }}
        >
          <GithubIcon className="w-7 h-7" />
        </motion.a>
        <motion.a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white"
          whileHover={{ scale: 1.2, y: -2 }}
        >
          <XIcon className="w-7 h-7" />
        </motion.a>
      </div>
    </div>
  </motion.div>
);

const TeamSection = () => (
  <section
    id="team"
    className="py-20 md:py-32 bg-gray-900 text-white px-4 border-t border-white/10"
  >
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0.5, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Crafted with Passion
        </h2>
        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
          Meet the developers behind the async await project.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <DeveloperCard
          name="Vishal"
          imageUrl="https://avatars.githubusercontent.com/u/130959006?v=4"
          githubUrl="https://github.com/vishalpandey1799"
          xUrl="https://x.com/VishalP23921104"
        />
        <DeveloperCard
          name="Soumen"
          imageUrl="https://avatars.githubusercontent.com/u/145513814?v=4"
          githubUrl="https://github.com/s-mahali"
          xUrl="https://x.com/_077void"
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 border-t border-white/10 text-gray-400 px-4">
    <div className="container mx-auto py-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
      <p>&copy; {new Date().getFullYear()} async await. All rights reserved.</p>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <a href="#" className="hover:text-white transition-colors">
          Twitter
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Privacy
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Terms
        </a>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-900 font-sans">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");
        body {
          font-family: "Inter", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slow-delay {
          animation: pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }
      `}</style>
      <Header />
      <main>
        <HeroSection navigate={navigate} />
        <FeaturesSection />
        <CTASection navigate={navigate} />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
