import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getDynamicExpensesForMonth,
  getExpensesForMonth,
  getIncomesForMonth,
  getMonthYear,
  getNextId,
  type BudgetCategory,
  type BudgetData,
  type DynamicExpense,
  type Entry,
  type Subscription,
} from "@/lib/storage";

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

type BudgetState = {
  data: BudgetData;
  selectedMonth: string;
};

type BudgetActions = {
  setSelectedMonth: (month: string) => void;
  addIncome: (entry: Omit<Entry, "id">) => void;
  editIncome: (entry: Entry) => void;
  deleteIncome: (id: number) => void;
  reorderIncomes: (incomes: Entry[]) => void;
  addExpense: (entry: Omit<Entry, "id">) => void;
  editExpense: (entry: Entry) => void;
  deleteExpense: (id: number) => void;
  reorderExpenses: (expenses: Entry[]) => void;
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  deleteSubscription: (id: number) => void;
  addCategory: (category: Omit<BudgetCategory, "id">) => void;
  editCategory: (category: BudgetCategory) => void;
  deleteCategory: (id: number) => void;
  toggleCategoryForMonth: (categoryId: number) => void;
  addDynamicExpense: (expense: Omit<DynamicExpense, "id">) => void;
  editDynamicExpense: (expense: DynamicExpense) => void;
  deleteDynamicExpense: (id: number) => void;
};

type BudgetStore = BudgetState & BudgetActions;

const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      data: defaultData,
      selectedMonth: getMonthYear(new Date()),

      setSelectedMonth: (month) => set({ selectedMonth: month }),

      addIncome: (entry) => {
        const { data, selectedMonth } = get();
        const currentIncomes =
          data.monthlyOverrides[selectedMonth]?.incomes || data.incomes;

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes: [
                  ...currentIncomes,
                  { ...entry, id: getNextId(currentIncomes) },
                ],
                expenses:
                  data.monthlyOverrides[selectedMonth]?.expenses ||
                  data.expenses,
              },
            },
          },
        });
      },

      editIncome: (entry) => {
        const { data, selectedMonth } = get();
        const currentIncomes =
          data.monthlyOverrides[selectedMonth]?.incomes || data.incomes;

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes: currentIncomes.map((i) =>
                  i.id === entry.id ? entry : i
                ),
                expenses:
                  data.monthlyOverrides[selectedMonth]?.expenses ||
                  data.expenses,
              },
            },
          },
        });
      },

      deleteIncome: (id) => {
        const { data, selectedMonth } = get();
        const currentIncomes =
          data.monthlyOverrides[selectedMonth]?.incomes || data.incomes;

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes: currentIncomes.filter((i) => i.id !== id),
                expenses:
                  data.monthlyOverrides[selectedMonth]?.expenses ||
                  data.expenses,
              },
            },
          },
        });
      },

      reorderIncomes: (incomes) => {
        const { data, selectedMonth } = get();

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes,
                expenses:
                  data.monthlyOverrides[selectedMonth]?.expenses ||
                  data.expenses,
              },
            },
          },
        });
      },

      addExpense: (entry) => {
        const { data, selectedMonth } = get();
        const currentExpenses =
          data.monthlyOverrides[selectedMonth]?.expenses || data.expenses;

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes:
                  data.monthlyOverrides[selectedMonth]?.incomes || data.incomes,
                expenses: [
                  ...currentExpenses,
                  { ...entry, id: getNextId(currentExpenses) },
                ],
              },
            },
          },
        });
      },

      editExpense: (entry) => {
        const { data, selectedMonth } = get();
        const currentExpenses =
          data.monthlyOverrides[selectedMonth]?.expenses || data.expenses;

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes:
                  data.monthlyOverrides[selectedMonth]?.incomes || data.incomes,
                expenses: currentExpenses.map((e) =>
                  e.id === entry.id ? entry : e
                ),
              },
            },
          },
        });
      },

      deleteExpense: (id) => {
        const { data, selectedMonth } = get();
        const currentExpenses =
          data.monthlyOverrides[selectedMonth]?.expenses || data.expenses;

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes:
                  data.monthlyOverrides[selectedMonth]?.incomes || data.incomes,
                expenses: currentExpenses.filter((e) => e.id !== id),
              },
            },
          },
        });
      },

      reorderExpenses: (expenses) => {
        const { data, selectedMonth } = get();

        set({
          data: {
            ...data,
            monthlyOverrides: {
              ...data.monthlyOverrides,
              [selectedMonth]: {
                ...data.monthlyOverrides[selectedMonth],
                incomes:
                  data.monthlyOverrides[selectedMonth]?.incomes || data.incomes,
                expenses,
              },
            },
          },
        });
      },

      addSubscription: (sub) => {
        const { data } = get();
        set({
          data: {
            ...data,
            subscriptions: [
              ...data.subscriptions,
              { ...sub, id: getNextId(data.subscriptions) },
            ],
          },
        });
      },

      deleteSubscription: (id) => {
        const { data } = get();
        set({
          data: {
            ...data,
            subscriptions: data.subscriptions.filter((s) => s.id !== id),
          },
        });
      },

      addCategory: (category) => {
        const { data } = get();
        set({
          data: {
            ...data,
            categories: [
              ...data.categories,
              { ...category, id: getNextId(data.categories) },
            ],
          },
        });
      },

      editCategory: (category) => {
        const { data } = get();
        set({
          data: {
            ...data,
            categories: data.categories.map((c) =>
              c.id === category.id ? category : c
            ),
          },
        });
      },

      deleteCategory: (id) => {
        const { data } = get();
        set({
          data: {
            ...data,
            categories: data.categories.filter((c) => c.id !== id),
            expenses: data.expenses.map((e) =>
              e.categoryId === id ? { ...e, categoryId: undefined } : e
            ),
            dynamicExpenses: data.dynamicExpenses.map((e) =>
              e.categoryId === id ? { ...e, categoryId: undefined } : e
            ),
          },
        });
      },

      toggleCategoryForMonth: (categoryId) => {
        const { data, selectedMonth } = get();
        const currentDisabled =
          data.disabledCategoriesByMonth[selectedMonth] || [];
        const isDisabled = currentDisabled.includes(categoryId);

        set({
          data: {
            ...data,
            disabledCategoriesByMonth: {
              ...data.disabledCategoriesByMonth,
              [selectedMonth]: isDisabled
                ? currentDisabled.filter((id) => id !== categoryId)
                : [...currentDisabled, categoryId],
            },
          },
        });
      },

      addDynamicExpense: (expense) => {
        const { data } = get();
        set({
          data: {
            ...data,
            dynamicExpenses: [
              ...data.dynamicExpenses,
              { ...expense, id: getNextId(data.dynamicExpenses) },
            ],
          },
        });
      },

      editDynamicExpense: (expense) => {
        const { data } = get();
        set({
          data: {
            ...data,
            dynamicExpenses: data.dynamicExpenses.map((e) =>
              e.id === expense.id ? expense : e
            ),
          },
        });
      },

      deleteDynamicExpense: (id) => {
        const { data } = get();
        set({
          data: {
            ...data,
            dynamicExpenses: data.dynamicExpenses.filter((e) => e.id !== id),
          },
        });
      },
    }),
    {
      name: "budget-app:data",
      partialize: (state) => ({ data: state.data }),
    }
  )
);

export function useBudget() {
  const store = useBudgetStore();

  const currentIncomes = getIncomesForMonth(store.data, store.selectedMonth);
  const currentExpenses = getExpensesForMonth(store.data, store.selectedMonth);
  const currentDynamicExpenses = getDynamicExpensesForMonth(
    store.data,
    store.selectedMonth
  );

  const totalIncome = currentIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDynamicExpenses = currentDynamicExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const disabledCategories =
    store.data.disabledCategoriesByMonth[store.selectedMonth] || [];

  const totalBudgeted = store.data.categories
    .filter((c) => !disabledCategories.includes(c.id))
    .reduce((sum, c) => sum + c.budgeted, 0);

  return {
    ...store,
    currentIncomes,
    currentExpenses,
    currentDynamicExpenses,
    totalIncome,
    totalExpenses,
    totalDynamicExpenses,
    totalBudgeted,
    disabledCategories,
  };
}
