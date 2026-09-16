import { notFound } from "next/navigation";
import { getCustomerEntitlements } from "../../../db/customer-repository";
import { getCustomerSession } from "../../../lib/customer-auth";
import { NeurofitnessGiftTraining } from "../../components/NeurofitnessGiftTraining";

export const dynamic = "force-dynamic";

export default async function NeurofitnessGiftPage() {
  const session = await getCustomerSession();
  if (!session) return null;
  const entitlements = await getCustomerEntitlements(session.customerId);
  if (!entitlements.some((item) => item.itemType === "TRAINING" && item.itemId === "training-neurofitness-gift")) notFound();
  return <NeurofitnessGiftTraining />;
}
