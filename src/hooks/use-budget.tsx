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
  incomes: [],
  expenses: [],
  subscriptions: [],
  categories: [],
  dynamicExpenses: [],
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
        const { data } = get();
        set({
          data: {
            ...data,
            incomes: [
              ...data.incomes,
              { ...entry, id: getNextId(data.incomes) },
            ],
          },
        });
      },

      editIncome: (entry) => {
        const { data } = get();
        set({
          data: {
            ...data,
            incomes: data.incomes.map((i) => (i.id === entry.id ? entry : i)),
          },
        });
      },

      deleteIncome: (id) => {
        const { data } = get();
        set({
          data: {
            ...data,
            incomes: data.incomes.filter((i) => i.id !== id),
          },
        });
      },

      reorderIncomes: (incomes) => {
        const { data } = get();
        set({
          data: {
            ...data,
            incomes,
          },
        });
      },

      addExpense: (entry) => {
        const { data } = get();
        set({
          data: {
            ...data,
            expenses: [
              ...data.expenses,
              { ...entry, id: getNextId(data.expenses) },
            ],
          },
        });
      },

      editExpense: (entry) => {
        const { data } = get();
        set({
          data: {
            ...data,
            expenses: data.expenses.map((e) => (e.id === entry.id ? entry : e)),
          },
        });
      },

      deleteExpense: (id) => {
        const { data } = get();
        set({
          data: {
            ...data,
            expenses: data.expenses.filter((e) => e.id !== id),
          },
        });
      },

      reorderExpenses: (expenses) => {
        const { data } = get();
        set({
          data: {
            ...data,
            expenses,
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

  const currentIncomes = getIncomesForMonth(store.data);
  const currentExpenses = getExpensesForMonth(store.data);
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
