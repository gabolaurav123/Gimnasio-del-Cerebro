import type { Metadata } from "next";
import { TrainingCatalogPage } from "../../../components/TrainingCatalogPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cursos | Gimnasio del Cerebro", description: "Cursos y experiencias Express de Gimnasio del Cerebro." };
export default function CoursesPage() { return <TrainingCatalogPage category="cursos" />; }
