import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata = {
  title: "Checkout & Cadastro | 88Barber",
  description: "Crie sua conta e escolha o melhor plano para sua barbearia.",
};

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialPlanKey = resolvedParams.plan || "barber-pro";

  return <CheckoutClient initialPlanKey={initialPlanKey} />;
}
