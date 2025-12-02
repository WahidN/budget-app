import { Route, Routes } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BudgetProvider, useBudget } from "@/hooks/use-budget";
import { DashboardPage } from "@/pages/dashboard";
import { SubscriptionsPage } from "@/pages/subscriptions";

function AppLayout() {
  const { selectedMonth, setSelectedMonth } = useBudget();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        <div className="flex flex-1 flex-col">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <AppLayout />
    </BudgetProvider>
  );
}
