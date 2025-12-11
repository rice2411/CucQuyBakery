/**
 * SePay Webhook API
 * POST /api/sepay/webhook
 */

import { PaymentStatus } from '@/types';
import { doc } from 'firebase/firestore';

interface ApiRequest {
  method?: string;
  body?: any;
}

interface ApiResponse {
  status: (code: number) => { json: (data: any) => void };
  json: (data: any) => void;
}

const firebaseApp = await import('firebase/app');
const firebaseFirestore = await import('firebase/firestore');

// Khởi tạo Firebase trực tiếp trong webhook (vì import tương đối không hoạt động trên Vercel)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Khởi tạo Firebase app (chỉ khởi tạo nếu chưa có)
let app;
try {
  app = firebaseApp.getApp();
} catch {
  app = firebaseApp.initializeApp(firebaseConfig);
}

// Tạo transaction
const createTransaction = async (webhookData: any) => {
  const db = firebaseFirestore.getFirestore(app);
  const { collection, addDoc, Timestamp } = firebaseFirestore;

    const extractFormattedOrderCode = (str: string) => {
      const match = str.match(/ORD\d+/);
      return match ? match[0].replace(/ORD(\d+)/, "ORD-$1") : null;
    }

    const transactionData = {
      sepayId: webhookData.id,
      gateway: webhookData.gateway || '',
      transactionDate: webhookData.transactionDate || '',
      accountNumber: webhookData.accountNumber || '',
      code: webhookData.code || null,
      content: webhookData.content || '',
      transferType: webhookData.transferType || 'in',
      transferAmount: Number(webhookData.transferAmount) || 0,
      accumulated: Number(webhookData.accumulated) || 0,
      subAccount: webhookData.subAccount || null,
      referenceCode: webhookData.referenceCode || '',
      description: webhookData.description || '',
      receivedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      orderNumber: extractFormattedOrderCode(webhookData.description)

    };
    const transactionsRef = collection(db, 'transaction');
    await addDoc(transactionsRef, transactionData);
  return transactionData;
}

// Cập nhật trạng thái thanh toán của đơn hàng
const updateOrderPaymentStatus = async (orderNumber: string) => {
  const db = firebaseFirestore.getFirestore(app);
  const { updateDoc } = firebaseFirestore;
  const orderRef = doc(db, 'orders', orderNumber);
  await updateDoc(orderRef, {
    paymentStatus: PaymentStatus.PAID,
  });
}

// Webhook handler
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;

    if (!webhookData || !webhookData.id) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    const transaction = await createTransaction(webhookData);
    await updateOrderPaymentStatus(transaction.orderNumber);
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
      transaction: transaction,
    });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
