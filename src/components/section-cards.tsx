import {
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SectionCardsProps = {
  totalIncome: number;
  totalExpenses: number;
  totalBudgeted: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

export function SectionCards({
  totalIncome,
  totalExpenses,
  totalBudgeted,
}: SectionCardsProps) {
  const balance = totalIncome - totalExpenses;
  const balanceAfterBudget = balance - totalBudgeted;
  const isPositive = balance >= 0;
  const isPositiveAfterBudget = balanceAfterBudget >= 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-emerald-600 @[250px]/card:text-3xl">
            {formatCurrency(totalIncome)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600">
              <IconTrendingUp />
              Income
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All income sources <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Sum of all income entries</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-rose-600 @[250px]/card:text-3xl">
            {formatCurrency(totalExpenses)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-rose-600">
              <IconTrendingDown />
              Expenses
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All expenses <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Sum of all expense entries
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Balance</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatCurrency(balance)}
          </CardTitle>
          <div
            className={`text-sm tabular-nums ${
              isPositiveAfterBudget ? "text-emerald-600/70" : "text-rose-600/70"
            }`}
          >
            {formatCurrency(balanceAfterBudget)} after budget
          </div>
          <CardAction>
            <Badge
              variant="outline"
              className={isPositive ? "text-emerald-600" : "text-rose-600"}
            >
              <IconWallet />
              {isPositive ? "Surplus" : "Deficit"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Income - Expenses <IconWallet className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Budget allocation: {formatCurrency(totalBudgeted)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
