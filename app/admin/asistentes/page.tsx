import { getAssistantProfiles } from "../../../db/customer-repository";
import { getProducts, getTrainings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { getOpenAIConfiguration } from "../../../lib/openai-config";
import { AssistantManager } from "../../components/AssistantManager";

export default async function AssistantsPage() {
  await requireAdminRole(["SUPERADMIN"]);
  const [profiles, products, trainings, openAI] = await Promise.all([getAssistantProfiles(), getProducts(true), getTrainings(true), getOpenAIConfiguration()]);
  const items = [...trainings.map((item) => ({ id: item.id, name: item.name, type: "TRAINING" as const })), ...products.map((item) => ({ id: item.id, name: item.name, type: "PRODUCT" as const }))];
  return <><div className="admin-page-heading"><div><span>IA por programa</span><h1>Asistentes personalizados</h1><p>Configura un asistente independiente para cada producto o entrenamiento. La clave API nunca se expone al navegador.</p></div></div><AssistantManager profiles={profiles} items={items} apiConfigured={openAI.configured} /></>;
}
