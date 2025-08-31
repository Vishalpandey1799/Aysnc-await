import Sidebar from "@/components/Sidebar";
import React from "react";
import { Outlet } from "react-router-dom";

const SidebarPage = () => {
  return (
    <div className="flex min-h-screen">
      <section className="fixed left-0 top-0 z-40 h-full w-[72px] md:w-[256px]">
        <Sidebar />
      </section>

      <main className="flex-1 ml-[72px] md:ml-[256px] flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarPage;
