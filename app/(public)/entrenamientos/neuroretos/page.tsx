import type { Metadata } from "next";
import { TrainingCatalogPage } from "../../../components/TrainingCatalogPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Neuroretos | Gimnasio del Cerebro", description: "Neuroretos de 21 días de Gimnasio del Cerebro." };
export default function ChallengesPage() { return <TrainingCatalogPage category="neuroretos" />; }
