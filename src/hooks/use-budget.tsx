import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { create } from "zustand";

import {
  initializeBudgetDocument,
  saveBudgetDataToFirestore,
  subscribeToBudgetData,
} from "@/lib/firestore-sync";
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
import { useAuth } from "./use-auth";

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
  loading: boolean;
  error: string | null;
};

type BudgetActions = {
  setSelectedMonth: (month: string) => void;
  setData: (data: BudgetData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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

const useBudgetStore = create<BudgetStore>()((set, get) => ({
  data: defaultData,
  selectedMonth: getMonthYear(new Date()),
  loading: false,
  error: null,

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addIncome: (entry) => {
    const { data } = get();
    set({
      data: {
        ...data,
        incomes: [...data.incomes, { ...entry, id: getNextId(data.incomes) }],
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
    const currentDisabled = data.disabledCategoriesByMonth[selectedMonth] || [];
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
}));

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

export function useBudget() {
  const { user } = useAuth();
  const store = useBudgetStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  const hasLoadedFromFirestoreRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);

  const syncToFirestore = useRef(
    debounce(async (userId: string, data: BudgetData) => {
      try {
        store.setLoading(true);
        store.setError(null);
        await saveBudgetDataToFirestore(userId, data);
      } catch (error: any) {
        const errorMessage =
          error?.message || "Failed to save data. Please try again.";
        store.setError(errorMessage);
        toast.error("Failed to save", {
          description: errorMessage,
        });
        console.error("Error syncing to Firestore:", error);
      } finally {
        store.setLoading(false);
      }
    }, 1000)
  ).current;

  useEffect(() => {
    if (!user?.uid) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      isInitializedRef.current = false;
      hasLoadedFromFirestoreRef.current = false;
      store.setData(defaultData);
      return;
    }

    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const userId = user.uid;
    let hasLoadedOnce = false;

    store.setLoading(true);
    store.setError(null);

    initializeBudgetDocument(userId, defaultData)
      .then(() => {
        hasLoadedFromFirestoreRef.current = true;
      })
      .catch((error: any) => {
        const errorMessage = error?.message || "Failed to initialize data.";
        store.setError(errorMessage);
        toast.error("Failed to load data", {
          description: errorMessage,
        });
        console.error("Error initializing budget document:", error);
      });

    const unsubscribe = subscribeToBudgetData(userId, (firestoreData) => {
      if (!hasLoadedOnce) {
        if (firestoreData) {
          store.setData(firestoreData);
          store.setLoading(false);
        } else {
          store.setData(defaultData);
          store.setLoading(false);
        }
        hasLoadedOnce = true;
        hasLoadedFromFirestoreRef.current = true;
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      isInitializedRef.current = false;
      hasLoadedFromFirestoreRef.current = false;
    };
  }, [user?.uid, store]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = useBudgetStore.subscribe((state) => {
      if (hasLoadedFromFirestoreRef.current) {
        const currentData = state.data;
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = window.setTimeout(async () => {
          try {
            await syncToFirestore(user.uid, currentData);
          } catch (error) {
            console.error("Error syncing:", error);
          }
        }, 1000);
      }
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user?.uid, syncToFirestore]);

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
