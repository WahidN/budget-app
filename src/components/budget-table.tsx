import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BudgetCategory, DynamicExpense, Entry } from "@/lib/storage";

type BudgetTableProps = {
  categories: BudgetCategory[];
  expenses: Entry[];
  dynamicExpenses: DynamicExpense[];
  disabledCategories: number[];
  onAdd: (category: Omit<BudgetCategory, "id">) => void;
  onEdit: (category: BudgetCategory) => void;
  onDelete: (id: number) => void;
  onToggleCategory: (categoryId: number) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

export function BudgetTable({
  categories,
  expenses,
  dynamicExpenses,
  disabledCategories,
  onAdd,
  onEdit,
  onDelete,
  onToggleCategory,
}: BudgetTableProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] =
    React.useState<BudgetCategory | null>(null);
  const [formData, setFormData] = React.useState({ name: "", budgeted: "" });

  const getSpentForCategory = (categoryId: number) => {
    const expenseTotal = expenses
      .filter((e) => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
    const dynamicTotal = dynamicExpenses
      .filter((e) => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
    return expenseTotal + dynamicTotal;
  };

  function resetForm() {
    setFormData({ name: "", budgeted: "" });
    setEditingCategory(null);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) resetForm();
  }

  function openEditDialog(category: BudgetCategory) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      budgeted: category.budgeted.toString(),
    });
    setDialogOpen(true);
  }

  function openAddDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const budgeted = parseFloat(formData.budgeted);
    if (!formData.name.trim() || isNaN(budgeted) || budgeted < 0) return;

    if (editingCategory) {
      onEdit({ id: editingCategory.id, name: formData.name.trim(), budgeted });
    } else {
      onAdd({ name: formData.name.trim(), budgeted });
    }

    resetForm();
    setDialogOpen(false);
  }

  const enabledCategories = categories.filter(
    (c) => !disabledCategories.includes(c.id)
  );
  const totalBudgeted = enabledCategories.reduce(
    (sum, c) => sum + c.budgeted,
    0
  );
  const totalSpent = enabledCategories.reduce(
    (sum, c) => sum + getSpentForCategory(c.id),
    0
  );

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 py-2 lg:px-6">
        <h2 className="text-lg font-semibold">Budget Categories</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <IconPlus />
              <span className="hidden lg:inline">Add Category</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit" : "Add"} Budget Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Groceries, Entertainment"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgeted">Monthly Budget</Label>
                <Input
                  id="budgeted"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budgeted}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, budgeted: e.target.value }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCategory ? "Save Changes" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-16">Active</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Budgeted</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="w-20">Progress</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                <>
                  {categories.map((category) => {
                    const isEnabled = !disabledCategories.includes(category.id);
                    const spent = getSpentForCategory(category.id);
                    const remaining = category.budgeted - spent;
                    const percentage =
                      category.budgeted > 0
                        ? Math.min((spent / category.budgeted) * 100, 100)
                        : 0;
                    const isOverBudget = spent > category.budgeted;

                    return (
                      <TableRow
                        key={category.id}
                        className={!isEnabled ? "opacity-50" : ""}
                      >
                        <TableCell>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() =>
                              onToggleCategory(category.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(category.budgeted)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(spent)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            isOverBudget ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOverBudget
                                    ? "bg-rose-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground text-xs w-10">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                size="icon"
                              >
                                <IconDotsVertical />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(category)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(category.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell></TableCell>
                    <TableCell>Total (Active)</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalBudgeted)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalSpent)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        totalSpent > totalBudgeted
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(totalBudgeted - totalSpent)}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No budget categories yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
