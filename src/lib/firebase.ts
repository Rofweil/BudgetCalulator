import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA3q1drfYYuq0MGztqr8T6Cq42RGKmiVno",
  authDomain: "budgetcalculator-22ef5.firebaseapp.com",
  projectId: "budgetcalculator-22ef5",
  storageBucket: "budgetcalculator-22ef5.firebasestorage.app",
  messagingSenderId: "574952478496",
  appId: "1:574952478496:web:0ac32ab61ec6b130db2945",
  measurementId: "G-2LL0GD2K30",
  databaseURL: "https://budgetcalculator-22ef5-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export async function sha256hex(msg: string): Promise<string> {
  const data = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
