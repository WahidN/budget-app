import { BudgetTable } from "@/components/budget-table";
import { DataTable } from "@/components/data-table";
import { DynamicExpensesTable } from "@/components/dynamic-expenses-table";
import { SectionCards } from "@/components/section-cards";
import { useBudget } from "@/hooks/use-budget";

export function DashboardPage() {
  const {
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
    addCategory,
    editCategory,
    deleteCategory,
    toggleCategoryForMonth,
    addDynamicExpense,
    editDynamicExpense,
    deleteDynamicExpense,
  } = useBudget();

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses + totalDynamicExpenses}
          totalBudgeted={totalBudgeted}
        />
        <div className="px-4 lg:px-6">
          <BudgetTable
            categories={data.categories}
            expenses={currentExpenses}
            dynamicExpenses={currentDynamicExpenses}
            disabledCategories={disabledCategories}
            onAdd={addCategory}
            onEdit={editCategory}
            onDelete={deleteCategory}
            onToggleCategory={toggleCategoryForMonth}
          />
        </div>
        <div className="px-4 lg:px-6">
          <DataTable
            title="Income"
            data={currentIncomes}
            onAdd={addIncome}
            onEdit={editIncome}
            onDelete={deleteIncome}
            onReorder={reorderIncomes}
          />
        </div>
        <div className="px-4 lg:px-6">
          <DataTable
            title="Expenses"
            data={currentExpenses}
            onAdd={addExpense}
            onEdit={editExpense}
            onDelete={deleteExpense}
            onReorder={reorderExpenses}
            subscriptions={data.subscriptions}
            categories={data.categories}
            showSubscriptionPicker
            showCategoryPicker
          />
        </div>
        <div className="px-4 lg:px-6">
          <DynamicExpensesTable
            expenses={currentDynamicExpenses}
            categories={data.categories}
            selectedMonth={selectedMonth}
            onAdd={addDynamicExpense}
            onEdit={editDynamicExpense}
            onDelete={deleteDynamicExpense}
          />
        </div>
      </div>
    </div>
  );
}
