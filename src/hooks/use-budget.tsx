import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getDynamicExpensesForMonth,
  getExpensesForMonth,
  getIncomesForMonth,
  getMonthYear,
  getNextId,
  loadBudgetData,
  saveBudgetData,
  type BudgetCategory,
  type BudgetData,
  type DynamicExpense,
  type Entry,
  type Subscription,
} from "@/lib/storage";

type BudgetContextType = {
  data: BudgetData;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  currentIncomes: Entry[];
  currentExpenses: Entry[];
  currentDynamicExpenses: DynamicExpense[];
  totalIncome: number;
  totalExpenses: number;
  totalDynamicExpenses: number;
  totalBudgeted: number;
  disabledCategories: number[];
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

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BudgetData>(() => loadBudgetData());
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getMonthYear(new Date())
  );

  useEffect(() => {
    saveBudgetData(data);
  }, [data]);

  const currentIncomes = useMemo(
    () => getIncomesForMonth(data, selectedMonth),
    [data, selectedMonth]
  );
  const currentExpenses = useMemo(
    () => getExpensesForMonth(data, selectedMonth),
    [data, selectedMonth]
  );
  const currentDynamicExpenses = useMemo(
    () => getDynamicExpensesForMonth(data, selectedMonth),
    [data, selectedMonth]
  );

  const totalIncome = useMemo(
    () => currentIncomes.reduce((sum, i) => sum + i.amount, 0),
    [currentIncomes]
  );
  const totalExpenses = useMemo(
    () => currentExpenses.reduce((sum, e) => sum + e.amount, 0),
    [currentExpenses]
  );
  const totalDynamicExpenses = useMemo(
    () => currentDynamicExpenses.reduce((sum, e) => sum + e.amount, 0),
    [currentDynamicExpenses]
  );

  const disabledCategories = useMemo(
    () => data.disabledCategoriesByMonth[selectedMonth] || [],
    [data.disabledCategoriesByMonth, selectedMonth]
  );

  const totalBudgeted = useMemo(
    () =>
      data.categories
        .filter((c) => !disabledCategories.includes(c.id))
        .reduce((sum, c) => sum + c.budgeted, 0),
    [data.categories, disabledCategories]
  );

  const hasMonthlyOverride = useCallback(
    (type: "incomes" | "expenses") => {
      return !!data.monthlyOverrides[selectedMonth]?.[type];
    },
    [data.monthlyOverrides, selectedMonth]
  );

  const ensureMonthlyOverride = useCallback(
    (type: "incomes" | "expenses") => {
      if (!hasMonthlyOverride(type)) {
        const baseData = type === "incomes" ? data.incomes : data.expenses;
        setData((prev) => ({
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              [type]: [...baseData],
            },
          },
        }));
      }
    },
    [hasMonthlyOverride, data.incomes, data.expenses, selectedMonth]
  );

  const addIncome = useCallback(
    (entry: Omit<Entry, "id">) => {
      ensureMonthlyOverride("incomes");
      setData((prev) => {
        const currentIncomes =
          prev.monthlyOverrides[selectedMonth]?.incomes || prev.incomes;
        return {
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              incomes: [
                ...currentIncomes,
                { ...entry, id: getNextId(currentIncomes) },
              ],
            },
          },
        };
      });
    },
    [ensureMonthlyOverride, selectedMonth]
  );

  const editIncome = useCallback(
    (entry: Entry) => {
      ensureMonthlyOverride("incomes");
      setData((prev) => {
        const currentIncomes =
          prev.monthlyOverrides[selectedMonth]?.incomes || prev.incomes;
        return {
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              incomes: currentIncomes.map((i) =>
                i.id === entry.id ? entry : i
              ),
            },
          },
        };
      });
    },
    [ensureMonthlyOverride, selectedMonth]
  );

  const deleteIncome = useCallback(
    (id: number) => {
      ensureMonthlyOverride("incomes");
      setData((prev) => {
        const currentIncomes =
          prev.monthlyOverrides[selectedMonth]?.incomes || prev.incomes;
        return {
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              incomes: currentIncomes.filter((i) => i.id !== id),
            },
          },
        };
      });
    },
    [ensureMonthlyOverride, selectedMonth]
  );

  const reorderIncomes = useCallback(
    (incomes: Entry[]) => {
      setData((prev) => ({
        ...prev,
        monthlyOverrides: {
          ...prev.monthlyOverrides,
          [selectedMonth]: {
            ...prev.monthlyOverrides[selectedMonth],
            incomes,
          },
        },
      }));
    },
    [selectedMonth]
  );

  const addExpense = useCallback(
    (entry: Omit<Entry, "id">) => {
      ensureMonthlyOverride("expenses");
      setData((prev) => {
        const currentExpenses =
          prev.monthlyOverrides[selectedMonth]?.expenses || prev.expenses;
        return {
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              expenses: [
                ...currentExpenses,
                { ...entry, id: getNextId(currentExpenses) },
              ],
            },
          },
        };
      });
    },
    [ensureMonthlyOverride, selectedMonth]
  );

  const editExpense = useCallback(
    (entry: Entry) => {
      ensureMonthlyOverride("expenses");
      setData((prev) => {
        const currentExpenses =
          prev.monthlyOverrides[selectedMonth]?.expenses || prev.expenses;
        return {
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              expenses: currentExpenses.map((e) =>
                e.id === entry.id ? entry : e
              ),
            },
          },
        };
      });
    },
    [ensureMonthlyOverride, selectedMonth]
  );

  const deleteExpense = useCallback(
    (id: number) => {
      ensureMonthlyOverride("expenses");
      setData((prev) => {
        const currentExpenses =
          prev.monthlyOverrides[selectedMonth]?.expenses || prev.expenses;
        return {
          ...prev,
          monthlyOverrides: {
            ...prev.monthlyOverrides,
            [selectedMonth]: {
              ...prev.monthlyOverrides[selectedMonth],
              expenses: currentExpenses.filter((e) => e.id !== id),
            },
          },
        };
      });
    },
    [ensureMonthlyOverride, selectedMonth]
  );

  const reorderExpenses = useCallback(
    (expenses: Entry[]) => {
      setData((prev) => ({
        ...prev,
        monthlyOverrides: {
          ...prev.monthlyOverrides,
          [selectedMonth]: {
            ...prev.monthlyOverrides[selectedMonth],
            expenses,
          },
        },
      }));
    },
    [selectedMonth]
  );

  const addSubscription = useCallback((sub: Omit<Subscription, "id">) => {
    setData((prev) => ({
      ...prev,
      subscriptions: [
        ...prev.subscriptions,
        { ...sub, id: getNextId(prev.subscriptions) },
      ],
    }));
  }, []);

  const deleteSubscription = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.id !== id),
    }));
  }, []);

  const addCategory = useCallback((category: Omit<BudgetCategory, "id">) => {
    setData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { ...category, id: getNextId(prev.categories) },
      ],
    }));
  }, []);

  const editCategory = useCallback((category: BudgetCategory) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === category.id ? category : c
      ),
    }));
  }, []);

  const deleteCategory = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      expenses: prev.expenses.map((e) =>
        e.categoryId === id ? { ...e, categoryId: undefined } : e
      ),
      dynamicExpenses: prev.dynamicExpenses.map((e) =>
        e.categoryId === id ? { ...e, categoryId: undefined } : e
      ),
    }));
  }, []);

  const toggleCategoryForMonth = useCallback(
    (categoryId: number) => {
      setData((prev) => {
        const currentDisabled =
          prev.disabledCategoriesByMonth[selectedMonth] || [];
        const isDisabled = currentDisabled.includes(categoryId);

        return {
          ...prev,
          disabledCategoriesByMonth: {
            ...prev.disabledCategoriesByMonth,
            [selectedMonth]: isDisabled
              ? currentDisabled.filter((id) => id !== categoryId)
              : [...currentDisabled, categoryId],
          },
        };
      });
    },
    [selectedMonth]
  );

  const addDynamicExpense = useCallback(
    (expense: Omit<DynamicExpense, "id">) => {
      setData((prev) => ({
        ...prev,
        dynamicExpenses: [
          ...prev.dynamicExpenses,
          { ...expense, id: getNextId(prev.dynamicExpenses) },
        ],
      }));
    },
    []
  );

  const editDynamicExpense = useCallback((expense: DynamicExpense) => {
    setData((prev) => ({
      ...prev,
      dynamicExpenses: prev.dynamicExpenses.map((e) =>
        e.id === expense.id ? expense : e
      ),
    }));
  }, []);

  const deleteDynamicExpense = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      dynamicExpenses: prev.dynamicExpenses.filter((e) => e.id !== id),
    }));
  }, []);

  const value = useMemo(
    () => ({
      data,
      selectedMonth,
      setSelectedMonth,
      currentIncomes,
      currentExpenses,
      currentDynamicExpenses,
      totalIncome,
      totalExpenses,
      totalDynamicExpenses,
      totalBudgeted,
      disabledCategories,
      addIncome,
      editIncome,
      deleteIncome,
      reorderIncomes,
      addExpense,
      editExpense,
      deleteExpense,
      reorderExpenses,
      addSubscription,
      deleteSubscription,
      addCategory,
      editCategory,
      deleteCategory,
      toggleCategoryForMonth,
      addDynamicExpense,
      editDynamicExpense,
      deleteDynamicExpense,
    }),
    [
      data,
      selectedMonth,
      currentIncomes,
      currentExpenses,
      currentDynamicExpenses,
      totalIncome,
      totalExpenses,
      totalDynamicExpenses,
      totalBudgeted,
      disabledCategories,
      addIncome,
      editIncome,
      deleteIncome,
      reorderIncomes,
      addExpense,
      editExpense,
      deleteExpense,
      reorderExpenses,
      addSubscription,
      deleteSubscription,
      addCategory,
      editCategory,
      deleteCategory,
      toggleCategoryForMonth,
      addDynamicExpense,
      editDynamicExpense,
      deleteDynamicExpense,
    ]
  );

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
