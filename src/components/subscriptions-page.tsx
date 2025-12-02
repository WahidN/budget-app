import { IconPlus, IconTrash } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Subscription } from "@/lib/storage";

type SubscriptionsPageProps = {
  subscriptions: Subscription[];
  onAdd: (sub: Omit<Subscription, "id">) => void;
  onDelete: (id: number) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

export function SubscriptionsPage({
  subscriptions,
  onAdd,
  onDelete,
}: SubscriptionsPageProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", amount: "" });

  const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!formData.name.trim() || isNaN(amount) || amount <= 0) return;

    onAdd({ name: formData.name.trim(), amount });
    setFormData({ name: "", amount: "" });
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="text-muted-foreground text-sm">
            Manage your recurring subscriptions. Add them to expenses from the
            dashboard.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 size-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subscription</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Netflix, Spotify"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add Subscription</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Monthly Subscriptions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-rose-600">
            {formatCurrency(total)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          {subscriptions.length} active subscription
          {subscriptions.length !== 1 ? "s" : ""}
        </CardFooter>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="@container/card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{sub.name}</CardTitle>
                  <CardDescription className="text-xl font-semibold tabular-nums">
                    {formatCurrency(sub.amount)}
                    <span className="text-muted-foreground text-sm font-normal">
                      {" "}
                      /month
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(sub.id)}
                >
                  <IconTrash className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}

        {subscriptions.length === 0 && (
          <div className="text-muted-foreground col-span-full py-12 text-center">
            No subscriptions yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
