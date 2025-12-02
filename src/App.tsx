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
  saveBudgetDataToFirestore,
  subscribeToBudgetData,
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

function BudgetSync({ userId }: { userId: string }) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const syncUnsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  const hasLoadedFromFirestoreRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);
  const isUpdatingFromFirestoreRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    useBudgetStore.getState().setLoading(true);
    useBudgetStore.getState().setError(null);

    initializeBudgetDocument(userId, defaultData)
      .then(() => {
        hasLoadedFromFirestoreRef.current = true;
      })
      .catch((error: any) => {
        const errorMessage = error?.message || "Failed to initialize data.";
        useBudgetStore.getState().setError(errorMessage);
        toast.error("Failed to load data", {
          description: errorMessage,
        });
        console.error("Error initializing budget document:", error);
      });

    let hasLoadedOnce = false;

    const unsubscribe = subscribeToBudgetData(userId, (firestoreData) => {
      if (!hasLoadedOnce) {
        isUpdatingFromFirestoreRef.current = true;

        if (syncUnsubscribeRef.current) {
          syncUnsubscribeRef.current();
          syncUnsubscribeRef.current = null;
        }

        if (firestoreData) {
          useBudgetStore.getState().setData(firestoreData);
        } else {
          useBudgetStore.getState().setData(defaultData);
        }

        useBudgetStore.getState().setLoading(false);
        hasLoadedOnce = true;
        hasLoadedFromFirestoreRef.current = true;

        setTimeout(() => {
          isUpdatingFromFirestoreRef.current = false;
        }, 2000);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (syncUnsubscribeRef.current) {
        syncUnsubscribeRef.current();
        syncUnsubscribeRef.current = null;
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      isInitializedRef.current = false;
      hasLoadedFromFirestoreRef.current = false;
      isUpdatingFromFirestoreRef.current = false;
      useBudgetStore.getState().setData(defaultData);
      useBudgetStore.getState().setLoading(false);
      useBudgetStore.getState().setError(null);
    };
  }, [userId]);

  useEffect(() => {
    if (!hasLoadedFromFirestoreRef.current) return;
    if (syncUnsubscribeRef.current) return;

    let previousData = useBudgetStore.getState().data;

    const syncToFirestore = async (data: typeof previousData) => {
      if (isUpdatingFromFirestoreRef.current) return;

      try {
        useBudgetStore.getState().setLoading(true);
        useBudgetStore.getState().setError(null);
        await saveBudgetDataToFirestore(userId, data);
      } catch (error: any) {
        const errorMessage =
          error?.message || "Failed to save data. Please try again.";
        useBudgetStore.getState().setError(errorMessage);
        toast.error("Failed to save", {
          description: errorMessage,
        });
        console.error("Error syncing to Firestore:", error);
      } finally {
        useBudgetStore.getState().setLoading(false);
      }
    };

    const debouncedSync = (() => {
      let timeout: number | null = null;
      return (data: typeof previousData) => {
        if (timeout) clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          syncToFirestore(data);
          timeout = null;
        }, 1000);
        syncTimeoutRef.current = timeout;
      };
    })();

    syncUnsubscribeRef.current = useBudgetStore.subscribe(
      (state) => state.data,
      (data) => {
        if (isUpdatingFromFirestoreRef.current) return;

        if (JSON.stringify(data) !== JSON.stringify(previousData)) {
          previousData = data;
          debouncedSync(data);
        }
      },
      {
        equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      }
    );

    return () => {
      if (syncUnsubscribeRef.current) {
        syncUnsubscribeRef.current();
        syncUnsubscribeRef.current = null;
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [userId]);

  return null;
}

export default function App() {
  const { user, loading } = useAuth();

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
          element={
            user ? (
              <>
                <BudgetSync userId={user.uid} />
                <AppLayout />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}
