import Sidebar from "@/components/Sidebar";
import React from "react";
import { Outlet } from "react-router-dom";

const SidebarPage = () => {
 
  return (
    <div className="flex min-h-screen">
      <section className="fixed left-0 top-0 z-40">
        <Sidebar  />
      </section>
      <div 
        className="flex-1 py-6 px-4 md:px-8 text-slate-100 overflow-y-auto ml-[72px] md:ml-[256px] transition-all duration-300"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarPage;
