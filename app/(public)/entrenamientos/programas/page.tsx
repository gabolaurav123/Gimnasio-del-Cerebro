import type { Metadata } from "next";
import { TrainingCatalogPage } from "../../../components/TrainingCatalogPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Programas | Gimnasio del Cerebro", description: "Programas principales de Gimnasio del Cerebro." };
export default function ProgramsPage() { return <TrainingCatalogPage category="programas" />; }
