import { getAssistantProfiles } from "../../../db/customer-repository";
import { getProducts, getTrainings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { getRuntimeValues } from "../../../lib/runtime-env";
import { AssistantManager } from "../../components/AssistantManager";

export default async function AssistantsPage() {
  await requireAdminRole(["SUPERADMIN"]);
  const [profiles, products, trainings, env] = await Promise.all([getAssistantProfiles(), getProducts(true), getTrainings(true), getRuntimeValues(["OPENAI_API_KEY"])]);
  const items = [...trainings.map((item) => ({ id: item.id, name: item.name, type: "TRAINING" as const })), ...products.map((item) => ({ id: item.id, name: item.name, type: "PRODUCT" as const }))];
  return <><div className="admin-page-heading"><div><span>IA por programa</span><h1>Asistentes personalizados</h1><p>Configura un asistente independiente para cada producto o entrenamiento. La clave API nunca se expone al navegador.</p></div></div><AssistantManager profiles={profiles} items={items} apiConfigured={Boolean(env.OPENAI_API_KEY)} /></>;
}
