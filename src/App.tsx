import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { defaultData, useBudget, useBudgetStore } from "@/hooks/use-budget";
import {
  initializeBudgetDocument,
  loadBudgetDataFromFirestore,
  saveBudgetDataToFirestore,
} from "@/lib/firestore-sync";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
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
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const isUpdatingFromFirestoreRef = useRef(false);

  useEffect(() => {
    if (user && user.uid) {
      initializeBudgetDocument(user.uid, defaultData);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid || loading) return;

    let timeoutId: number | null = null;
    let previousDataString = JSON.stringify(useBudgetStore.getState().data);

    const unsubscribe = useBudgetStore.subscribe(
      (state) => state.data,
      (data) => {
        if (isUpdatingFromFirestoreRef.current) return;

        const currentDataString = JSON.stringify(data);
        if (currentDataString === previousDataString) return;

        previousDataString = currentDataString;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(async () => {
          try {
            await saveBudgetDataToFirestore(user.uid, data);
          } catch (error: any) {
            const errorMessage =
              error?.message || "Failed to save data. Please try again.";
            toast.error("Failed to save", {
              description: errorMessage,
            });
            console.error("Error saving budget data to Firestore:", error);
          }
        }, 1000);
      },
      {
        equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      }
    );

    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, user]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadData = async () => {
      isUpdatingFromFirestoreRef.current = true;
      try {
        const data = await loadBudgetDataFromFirestore(user.uid);
        if (data !== null) {
          useBudgetStore.setState({ data: data });
        }
      } finally {
        setTimeout(() => {
          isUpdatingFromFirestoreRef.current = false;
        }, 500);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}
