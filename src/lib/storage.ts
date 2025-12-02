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

const STORAGE_KEY = "budget-app:data";

const defaultData: BudgetData = {
  incomes: [
    {
      id: 1,
      title: "Salary",
      description: "Monthly salary",
      amount: 4500,
      date: "2025-01-01",
    },
    {
      id: 2,
      title: "Freelance",
      description: "Side project",
      amount: 800,
      date: "2025-01-15",
    },
  ],
  expenses: [
    {
      id: 1,
      title: "Rent",
      description: "Monthly rent",
      amount: 1800,
      date: "2025-01-01",
    },
    {
      id: 2,
      title: "Groceries",
      description: "Weekly groceries",
      amount: 150,
      date: "2025-01-05",
      categoryId: 1,
    },
  ],
  subscriptions: [
    { id: 1, name: "Netflix", amount: 15.99 },
    { id: 2, name: "Spotify", amount: 9.99 },
    { id: 3, name: "Notion", amount: 10 },
  ],
  categories: [
    { id: 1, name: "Groceries", budgeted: 500 },
    { id: 2, name: "Entertainment", budgeted: 200 },
    { id: 3, name: "Transportation", budgeted: 150 },
    { id: 4, name: "Dining Out", budgeted: 250 },
  ],
  dynamicExpenses: [
    {
      id: 1,
      title: "Weekly groceries",
      amount: 85.5,
      date: "2025-01-05",
      categoryId: 1,
    },
    { id: 2, title: "Gas", amount: 45.0, date: "2025-01-08", categoryId: 3 },
    {
      id: 3,
      title: "Coffee shop",
      amount: 12.5,
      date: "2025-01-10",
      categoryId: 4,
    },
  ],
  monthlyOverrides: {},
  disabledCategoriesByMonth: {},
};

export function loadBudgetData(): BudgetData {
  if (typeof window === "undefined") return defaultData;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultData;
  try {
    const parsed = JSON.parse(stored) as BudgetData;
    if (!parsed.categories) {
      parsed.categories = defaultData.categories;
    }
    if (!parsed.dynamicExpenses) {
      parsed.dynamicExpenses = defaultData.dynamicExpenses;
    }
    if (!parsed.monthlyOverrides) {
      parsed.monthlyOverrides = {};
    }
    if (!parsed.disabledCategoriesByMonth) {
      parsed.disabledCategoriesByMonth = {};
    }
    return parsed;
  } catch {
    return defaultData;
  }
}

export function saveBudgetData(data: BudgetData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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

export function getIncomesForMonth(data: BudgetData, month: string): Entry[] {
  if (data.monthlyOverrides[month]?.incomes) {
    return data.monthlyOverrides[month].incomes;
  }
  return data.incomes;
}

export function getExpensesForMonth(data: BudgetData, month: string): Entry[] {
  if (data.monthlyOverrides[month]?.expenses) {
    return data.monthlyOverrides[month].expenses;
  }
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
