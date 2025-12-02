import { SubscriptionsPage as SubscriptionsContent } from "@/components/subscriptions-page";
import { useBudget } from "@/hooks/use-budget";

export function SubscriptionsPage() {
  const { data, addSubscription, deleteSubscription } = useBudget();

  return (
    <SubscriptionsContent
      subscriptions={data.subscriptions}
      onAdd={addSubscription}
      onDelete={deleteSubscription}
    />
  );
}
