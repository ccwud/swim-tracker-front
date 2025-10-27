'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface FinancialRecord {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  amount: number;
  recordDate: string;
}

export default function FinancialReportPage() {
  const { user, loading: authLoading } = useAuth();

  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<{ income: number; expense: number; net: number }>({ income: 0, expense: 0, net: 0 });
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string; income: number; expense: number; net: number }>>([]);
  const [categoryStats, setCategoryStats] = useState<Array<{ categoryId: number; categoryName: string; income: number; expense: number; net: number }>>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadReport();
  }, [user, authLoading]);

  const mapRecords = (data: any[]): FinancialRecord[] => {
    return (data || []).map((r: any) => ({
      id: Number(r.id ?? Date.now()),
      categoryId: Number(r.categoryId ?? 0),
      categoryName: r.categoryName ?? '',
      categoryType: (r.categoryType ?? r.type ?? 'EXPENSE') as 'INCOME' | 'EXPENSE',
      amount: Number(r.amount ?? 0),
      recordDate: r.recordDate ?? r.date ?? new Date().toISOString().split('T')[0],
    }));
  };

  const computeStatsFrom = (list: FinancialRecord[]) => {
    const income = list.filter(r => r.categoryType === 'INCOME').reduce((s, r) => s + r.amount, 0);
    const expense = list.filter(r => r.categoryType === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
    return { income, expense, net: income - expense };
  };

  const computeMonthlyStatsFrom = (list: FinancialRecord[]) => {
    const map = new Map<string, { income: number; expense: number }>();
    list.forEach(r => {
      const month = (r.recordDate || '').slice(0, 7);
      const v = map.get(month) || { income: 0, expense: 0 };
      if (r.categoryType === 'INCOME') v.income += r.amount; else v.expense += r.amount;
      map.set(month, v);
    });
    const result = Array.from(map.entries()).map(([month, v]) => ({ month, income: v.income, expense: v.expense, net: v.income - v.expense }))
      .sort((a, b) => a.month < b.month ? 1 : -1)
      .slice(0, 6);
    return result;
  };

  const computeCategoryStatsFrom = (list: FinancialRecord[]) => {
    const map = new Map<number, { name: string; income: number; expense: number }>();
    list.forEach(r => {
      const v = map.get(r.categoryId) || { name: r.categoryName, income: 0, expense: 0 };
      if (r.categoryType === 'INCOME') v.income += r.amount; else v.expense += r.amount;
      map.set(r.categoryId, v);
    });
    const result = Array.from(map.entries()).map(([categoryId, v]) => ({
      categoryId,
      categoryName: v.name,
      income: v.income,
      expense: v.expense,
      net: v.income - v.expense,
    })).sort((a, b) => (b.expense + b.income) - (a.expense + a.income)).slice(0, 8);
    return result;
  };

  const loadReport = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      // 概览统计
      try {
        const resp = await api.financialRecords.statistics();
        const d = resp.data?.data ?? resp.data;
        const income = Number(d?.incomeTotal ?? d?.income ?? 0);
        const expense = Number(d?.expenseTotal ?? d?.expense ?? 0);
        setStats({ income, expense, net: income - expense });
      } catch {
        const recentResp = await api.financialRecords.recent(50);
        const data = Array.isArray(recentResp.data) ? recentResp.data : recentResp.data?.data;
        const list = mapRecords(data || []);
        setStats(computeStatsFrom(list));
      }

      // 月度统计
      try {
        const resp = await api.financialRecords.monthlyStatistics(new Date().getFullYear());
        const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
        const list = (data || []).map((m: any) => ({
          month: m.month ?? m.period ?? '',
          income: Number(m.incomeTotal ?? m.income ?? 0),
          expense: Number(m.expenseTotal ?? m.expense ?? 0),
          net: Number(m.netTotal ?? (Number(m.incomeTotal ?? m.income ?? 0) - Number(m.expenseTotal ?? m.expense ?? 0)))
        }));
        setMonthlyStats(list.length ? list.slice(0, 6) : []);
      } catch {
        const recentResp = await api.financialRecords.recent(50);
        const data = Array.isArray(recentResp.data) ? recentResp.data : recentResp.data?.data;
        const list = mapRecords(data || []);
        setMonthlyStats(computeMonthlyStatsFrom(list));
      }

      // 分类统计
      try {
        const resp = await api.financialRecords.categoryStatistics();
        const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
        const list = (data || []).map((c: any) => ({
          categoryId: Number(c.categoryId ?? 0),
          categoryName: c.categoryName ?? '',
          income: Number(c.incomeTotal ?? c.income ?? 0),
          expense: Number(c.expenseTotal ?? c.expense ?? 0),
          net: Number(c.netTotal ?? (Number(c.incomeTotal ?? c.income ?? 0) - Number(c.expenseTotal ?? c.expense ?? 0)))
        }));
        setCategoryStats(list.length ? list.slice(0, 8) : []);
      } catch {
        const recentResp = await api.financialRecords.recent(50);
        const data = Array.isArray(recentResp.data) ? recentResp.data : recentResp.data?.data;
        const list = mapRecords(data || []);
        setCategoryStats(computeCategoryStatsFrom(list));
      }
    } catch (e: any) {
      setError(e?.message || '加载报告失败');
    } finally {
      setStatsLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner text="正在验证身份..." />;
  }

  if (!user) {
    return <LoadingSpinner text="正在跳转到登录..." />;
  }

  return (
    <Layout showNavigation>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">记账报告</h1>

        {error && <ErrorMessage message={error} />}

        {/* 统计概览 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">统计概览</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载统计数据..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border">
                <div className="text-sm text-gray-600">收入</div>
                <div className="text-2xl font-bold text-green-700">¥{stats.income.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border">
                <div className="text-sm text-gray-600">支出</div>
                <div className="text-2xl font-bold text-red-700">¥{stats.expense.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border">
                <div className="text-sm text-gray-600">净值</div>
                <div className="text-2xl font-bold text-blue-700">¥{stats.net.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        {/* 分类统计 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">分类统计（Top 8）</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载分类统计..." />
          ) : categoryStats.length === 0 ? (
            <p className="text-gray-500">暂无分类统计</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryStats.map(cs => (
                <div key={cs.categoryId} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{cs.categoryName}</span>
                    <span className={`text-sm ${cs.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>净值 ¥{cs.net.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">收入 ¥{cs.income.toFixed(2)} | 支出 ¥{cs.expense.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 月度统计 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">月度统计（近6月）</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载月度统计..." />
          ) : monthlyStats.length === 0 ? (
            <p className="text-gray-500">暂无月度统计</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {monthlyStats.map(ms => (
                <div key={ms.month} className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-medium text-gray-900">{ms.month}</div>
                  <div className="text-sm text-gray-600 mt-1">收入 ¥{ms.income.toFixed(2)} | 支出 ¥{ms.expense.toFixed(2)}</div>
                  <div className={`text-sm mt-1 ${ms.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>净值 ¥{ms.net.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}