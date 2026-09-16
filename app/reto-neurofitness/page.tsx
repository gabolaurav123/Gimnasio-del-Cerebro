import type { Metadata } from "next";
import { NeurofitnessChallenge } from "../components/NeurofitnessChallenge";
import { getSettings } from "../../db/repository";
import { getCustomerSession } from "../../lib/customer-auth";

export const metadata: Metadata = { title: "Reto Neurofitness", description: "60 segundos, cuatro desafíos y un perfil lúdico de desempeño Neurofitness." };
export const dynamic = "force-dynamic";

export default async function NeurofitnessChallengePage() {
  const [settings, session] = await Promise.all([getSettings(), getCustomerSession()]);
  return <NeurofitnessChallenge rankingLabel={settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM"} currentCustomer={session ? { name: session.name, email: session.email } : null} />;
}
