import React, { useState, useMemo, useEffect } from 'react';
import { OrderStatus } from '../../types';
import { generateDashboardInsights } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOrders } from '../../contexts/OrderContext';
import DashboardMetrics from './components/DashboardMetrics';
import DashboardChart from './components/DashboardChart';
import DashboardInsights from './components/DashboardInsights';

type TimeRange = 'week' | 'month' | 'year';

const DashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const { language } = useLanguage();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    setReferenceDate(new Date());
  }, [timeRange]);

  const { startDate, endDate, prevStartDate, prevEndDate } = useMemo(() => {
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);
    
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);

    const prevEnd = new Date(end);
    const prevStart = new Date(start);

    if (timeRange === 'week') {
      start.setDate(end.getDate() - 6);
      prevEnd.setDate(end.getDate() - 7);
      prevStart.setDate(start.getDate() - 7);
    } else if (timeRange === 'month') {
      // Set to first day of month
      start.setDate(1);
      // For end date, go to next month