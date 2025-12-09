import { GoogleGenAI } from "@google/genai";
import { Order } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in the environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateOrderAnalysis = async (order: Order, promptType: 'email' | 'risk' | 'summary'): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key missing. Unable to generate analysis.";

  let prompt = "";
  const orderDetails = JSON.stringify(order, null, 2);

  switch (promptType) {
    case 'email':
      prompt = `You are a customer service expert. Write a professional, empathetic email to the customer regarding their order. 
      If the status is DELIVERED, thank them. 
      If SHIPPED, provide tracking info. 
      If DELAYED or PENDING for a long time, apologize.
      
      Order Details:
      ${orderDetails}`;
      break;
    case 'risk':
      prompt = `Analyze the following order for potential fraud risk or fulfillment issues. 
      Consider the order value, item types, and address. 
      Return a brief risk assessment score (Low/Medium/High) and a 2-sentence explanation.

      Order Details:
      ${orderDetails}`;
      break;
    case 'summary':
      prompt = `Summarize this order in 3 bullet points for the fulfillment team. Highlight high-value items or special handling needs if apparent.
      
      Order Details:
      ${orderDetails}`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate content. Please try again.";
  }
};

export const generateDashboardInsights = async (orders: Order[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key missing.";

  // Simplify order data to save tokens and focus on metrics
  const summaryData = orders.map(o => ({
    status: o.status,
    total: o.total,
    date: o.date,
    items: o.items.length
  }));

  const prompt = `You are a business analyst. specific Analyze these recent orders and provide a brief daily briefing.
  1. Identify any trends (e.g. high volume of cancellations, surge in revenue).
  2. Suggest one actionable step for the operations manager.
  3. Keep it under 150 words.
  
  Data: ${JSON.stringify(summaryData)}`;

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Dashboard Error:", error);
    return "Unable to generate insights at this time.";
  }
}