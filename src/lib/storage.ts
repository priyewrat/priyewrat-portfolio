import { PortfolioData, Message } from "../types";
import { defaultPortfolioData } from "../data";
import { db, isFirebaseConfigured, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc, updateDoc } from "./firebase";

const PORTFOLIO_STORAGE_KEY = "priyewrat_portfolio_data";
const MESSAGES_STORAGE_KEY = "priyewrat_portfolio_messages";
const AUTH_STORAGE_KEY = "priyewrat_admin_authenticated";

/**
 * ✅ Initialize portfolio data subscription
 * Always listen to Firestore as the source of truth.
 */
export function initPortfolioData(onDataUpdated: (data: PortfolioData) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    onDataUpdated(getPortfolioData());
    return () => {};
  }

  const docRef = doc(db, "portfolio", "main");
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as PortfolioData;
        onDataUpdated(cloudData);
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(cloudData));
      } else {
        const initialData = getPortfolioData();
        setDoc(docRef, initialData).catch((err) => console.error("Seeding error:", err));
      }
    },
    (error) => {
      console.error("Firestore subscription error:", error);
    }
  );

  return unsubscribe;
}

/**
 * ✅ Save portfolio data (Firestore first, then localStorage)
 */
export async function savePortfolioData(data: PortfolioData): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
    return { success: false, error: "Firebase not configured" };
  }

  try {
    const docRef = doc(db, "portfolio", "main");
    await setDoc(docRef, data, { merge: true });
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
    return { success: true };
  } catch (err: any) {
    console.error("Firestore save error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * ✅ Fallback: get portfolio data from localStorage
 */
export function getPortfolioData(): PortfolioData {
  if (typeof window === "undefined") return defaultPortfolioData;
  const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (!stored) return defaultPortfolioData;
  try {
    return JSON.parse(stored) as PortfolioData;
  } catch {
    return defaultPortfolioData;
  }
}

/**
 * ✅ Subscribe to messages in Firestore (collection-based)
 */
export function subscribeMessages(onMessagesUpdated: (messages: Message[]) => void): () => void {
  if (!isFirebaseConfigured || !db) return () => {};

  const unsubscribe = onSnapshot(
    collection(db, "messages"),
    (snapshot) => {
      const messages: Message[] = snapshot.docs.map((docSnap) => docSnap.data() as Message);
      onMessagesUpdated(messages);
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    },
    (error) => {
      console.error("Firestore subscription error for messages:", error);
    }
  );

  return unsubscribe;
}

/**
 * ✅ Add a new message (each message is its own doc)
 */
export async function addMessage(message: Omit<Message, "id" | "timestamp" | "read">): Promise<Message | null> {
  if (!isFirebaseConfigured || !db) return null;

  const newMessage: Message = {
    ...message,
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
  };

  try {
    await addDoc(collection(db, "messages"), newMessage);
    return newMessage;
  } catch (err) {
    console.error("Failed to add message:", err);
    return null;
  }
}

/**
 * ✅ Delete a message by Firestore docId
 */
export async function deleteMessage(docId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await deleteDoc(doc(db, "messages", docId));
  } catch (err) {
    console.error("Failed to delete message:", err);
  }
}

/**
 * ✅ Mark a message as read
 */
export async function markMessageAsRead(docId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await updateDoc(doc(db, "messages", docId), { read: true });
  } catch (err) {
    console.error("Failed to mark message as read:", err);
  }
}

/**
 * ✅ Admin auth helpers
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function setAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === "undefined") return;
  if (authenticated) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
