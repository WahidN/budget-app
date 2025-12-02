import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BudgetCategory, DynamicExpense } from "@/lib/storage";

type DynamicExpensesTableProps = {
  expenses: DynamicExpense[];
  categories: BudgetCategory[];
  selectedMonth: string;
  onAdd: (expense: Omit<DynamicExpense, "id">) => void;
  onEdit: (expense: DynamicExpense) => void;
  onDelete: (id: number) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

const formatMonthYear = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const getDefaultDateForMonth = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  return `${year}-${month}-01`;
};

export function DynamicExpensesTable({
  expenses,
  categories,
  selectedMonth,
  onAdd,
  onEdit,
  onDelete,
}: DynamicExpensesTableProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] =
    React.useState<DynamicExpense | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    amount: "",
    date: getDefaultDateForMonth(selectedMonth),
    categoryId: "",
  });

  React.useEffect(() => {
    if (!dialogOpen && !editingExpense) {
      setFormData((prev) => ({
        ...prev,
        date: getDefaultDateForMonth(selectedMonth),
      }));
    }
  }, [selectedMonth, dialogOpen, editingExpense]);

  const totalForMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = React.useMemo(() => {
    const totals: Record<number, number> = {};
    expenses.forEach((expense) => {
      if (expense.categoryId) {
        totals[expense.categoryId] =
          (totals[expense.categoryId] || 0) + expense.amount;
      }
    });
    return totals;
  }, [expenses]);

  function resetForm() {
    setFormData({
      title: "",
      amount: "",
      date: getDefaultDateForMonth(selectedMonth),
      categoryId: "",
    });
    setEditingExpense(null);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) resetForm();
  }

  function openEditDialog(expense: DynamicExpense) {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      date: expense.date,
      categoryId: expense.categoryId?.toString() ?? "",
    });
    setDialogOpen(true);
  }

  function openAddDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!formData.title.trim() || isNaN(amount) || amount <= 0) return;

    const expenseData = {
      title: formData.title.trim(),
      amount,
      date: formData.date,
      categoryId: formData.categoryId
        ? parseInt(formData.categoryId)
        : undefined,
    };

    if (editingExpense) {
      onEdit({ ...expenseData, id: editingExpense.id });
    } else {
      onAdd(expenseData);
    }

    resetForm();
    setDialogOpen(false);
  }

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 py-2 lg:px-6">
        <h2 className="text-lg font-semibold">Dynamic Expenses</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <IconPlus />
              <span className="hidden lg:inline">Add Expense</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit" : "Add"} Dynamic Expense
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Description</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Weekly groceries, Gas"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      categoryId: val === "none" ? "" : val,
                    }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingExpense ? "Save Changes" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 pb-2 lg:px-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const spent = categoryTotals[cat.id] || 0;
            if (spent === 0) return null;
            return (
              <Badge key={cat.id} variant="secondary" className="text-xs">
                {cat.name}: {formatCurrency(spent)}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                <>
                  {expenses
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.title}
                        </TableCell>
                        <TableCell>
                          {getCategoryName(expense.categoryId) ? (
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(expense.categoryId)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-rose-600">
                          {formatCurrency(expense.amount)}
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
                                onClick={() => openEditDialog(expense)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(expense.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={3}>
                      Total for {formatMonthYear(selectedMonth)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatCurrency(totalForMonth)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No expenses for {formatMonthYear(selectedMonth)}.
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
