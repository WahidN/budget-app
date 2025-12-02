import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type SiteHeaderProps = {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
};

const formatMonthYear = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const getMonthYear = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

export function SiteHeader({ selectedMonth, onMonthChange }: SiteHeaderProps) {
  function navigateMonth(direction: -1 | 1) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const newDate = new Date(year, month - 1 + direction);
    onMonthChange(getMonthYear(newDate));
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => navigateMonth(-1)}
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <h1 className="min-w-[160px] text-center text-base font-medium">
            {formatMonthYear(selectedMonth)}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => navigateMonth(1)}
          >
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
