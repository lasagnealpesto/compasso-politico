"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCrmHost, setIsCrmHost] = useState(false);

  useEffect(() => {
    setIsCrmHost(window.location.hostname === "crm.compassopolitico.it");
  }, []);

  const isCrm = pathname.startsWith("/crm") || isCrmHost;

  if (isCrm) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main key={pathname} className="flex-1 page-enter">{children}</main>
      <Footer />
    </>
  );
}
