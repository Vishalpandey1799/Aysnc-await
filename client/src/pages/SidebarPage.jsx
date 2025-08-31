import Sidebar from "@/components/Sidebar";
import React from "react";
import { Outlet } from "react-router-dom";

const SidebarPage = () => {
  return (
    <>
      <div className="flex min-h-screen pl-[72px] md:pl-[256px] border-1 border-red-500">
        <section className="fixed left-0 top-0 z-40 w-[72px] md:w-[256px]">
          <Sidebar />
        </section>
      </div>
      <div className="flex flex-1 items-center justify-center p-0">
        <Outlet />
      </div>
    </>
  );
};

export default SidebarPage;
