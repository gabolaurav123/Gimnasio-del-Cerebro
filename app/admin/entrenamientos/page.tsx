import { getTrainings } from "../../../db/repository";
import { ContentManager } from "../../components/AdminUI";
export default async function AdminTrainings() { const trainings = await getTrainings(true); return <><div className="admin-page-heading"><div><span>Catálogo actual</span><h1>Entrenamientos</h1><p>Crea, publica u oculta programas sin eliminarlos accidentalmente.</p></div></div><section className="admin-card admin-card--flush"><ContentManager kind="trainings" trainings={trainings} /></section></>; }
