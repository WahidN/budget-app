export type Entry = {
  id: number;
  title: string;
  description: string;
  amount: number;
  date: string;
  subscriptionId?: number;
  categoryId?: number;
};

export type Subscription = {
  id: number;
  name: string;
  amount: number;
};

export type BudgetCategory = {
  id: number;
  name: string;
  budgeted: number;
};

export type DynamicExpense = {
  id: number;
  title: string;
  amount: number;
  date: string;
  categoryId?: number;
};

export type MonthlyOverride = {
  incomes: Entry[];
  expenses: Entry[];
};

export type BudgetData = {
  incomes: Entry[];
  expenses: Entry[];
  subscriptions: Subscription[];
  categories: BudgetCategory[];
  dynamicExpenses: DynamicExpense[];
  monthlyOverrides: Record<string, MonthlyOverride>;
  disabledCategoriesByMonth: Record<string, number[]>;
};

export function getNextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

export function getMonthYear(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function getIncomesForMonth(data: BudgetData): Entry[] {
  return data.incomes;
}

export function getExpensesForMonth(data: BudgetData): Entry[] {
  return data.expenses;
}

export function getDynamicExpensesForMonth(
  data: BudgetData,
  month: string
): DynamicExpense[] {
  return data.dynamicExpenses.filter((expense) => {
    const expenseMonth = getMonthYear(new Date(expense.date));
    return expenseMonth === month;
  });
}
