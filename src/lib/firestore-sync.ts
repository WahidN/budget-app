import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";
import type { BudgetData } from "./storage";

const COLLECTION_NAME = "budgets";

export async function loadBudgetDataFromFirestore(
  userId: string
): Promise<BudgetData | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as BudgetData;
    }
    return null;
  } catch (error) {
    console.error("Error loading budget data from Firestore:", error);
    return null;
  }
}

export async function saveBudgetDataToFirestore(
  userId: string,
  data: BudgetData
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, data, { merge: false });
  } catch (error) {
    console.error("Error saving budget data to Firestore:", error);
    throw error;
  }
}

export function subscribeToBudgetData(
  userId: string,
  callback: (data: BudgetData | null) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, userId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as BudgetData);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error subscribing to budget data:", error);
      callback(null);
    }
  );
}
