import type { Metadata } from "next";
import GrandiTemiClient from "./GrandiTemiClient";
import { partiti } from "@/lib/data";

export const metadata: Metadata = {
  title: "Grandi Temi",
  description: "Le posizioni di tutti i partiti italiani sui grandi temi: economia, immigrazione, giustizia, ambiente, esteri e welfare.",
  alternates: { canonical: "/grandi-temi" },
};

export default function GrandiTemiPage() {
  return <GrandiTemiClient partiti={partiti} />;
}
