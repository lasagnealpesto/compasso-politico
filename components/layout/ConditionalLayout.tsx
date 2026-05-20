"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCrm = pathname.startsWith("/crm");

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
