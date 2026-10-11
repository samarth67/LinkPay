import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createPaymentLink(data: {
  wallet: string;
  amount: string;
  note: string;
}) {
  const docRef = await addDoc(collection(db, "paymentLinks"), {
    wallet: data.wallet,
    amount: data.amount,
    note: data.note,
    chainId: 5042,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}