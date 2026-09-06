import type { Metadata } from "next";
import { TrainingCatalogPage } from "../../../components/TrainingCatalogPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Talleres | Gimnasio del Cerebro", description: "Talleres temáticos de Gimnasio del Cerebro." };
export default function WorkshopsPage() { return <TrainingCatalogPage category="talleres" />; }
