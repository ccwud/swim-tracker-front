'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';

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

  const [stats, setStats] = useState<{
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    recordCount?: number;
    incomeCount?: number;
    expenseCount?: number;
    averageIncome?: number;
    averageExpense?: number;
    topIncomeCategory?: { categoryId?: number; categoryName?: string; amount?: number } | null;
    topExpenseCategory?: { categoryId?: number; categoryName?: string; amount?: number } | null;
  }>({ totalIncome: 0, totalExpense: 0, netAmount: 0 });
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string | number; totalIncome: number; totalExpense: number; netAmount: number; recordCount?: number }>>([]);
  const [categoryStats, setCategoryStats] = useState<Array<{ categoryName: string; amount: number; percentage: number }>>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

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

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const getEffectiveDates = () => {
    const today = new Date();
    const end = (endDate && endDate.trim()) ? endDate : formatDate(today);
    const start = (startDate && startDate.trim())
      ? startDate
      : formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365));
    return { start, end };
  };

  const computeStatsFrom = (list: FinancialRecord[]) => {
    const totalIncome = list.filter(r => r.categoryType === 'INCOME').reduce((s, r) => s + r.amount, 0);
    const totalExpense = list.filter(r => r.categoryType === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
    return { totalIncome, totalExpense, netAmount: totalIncome - totalExpense };
  };

  const computeMonthlyStatsFrom = (list: FinancialRecord[]) => {
    const map = new Map<string, { totalIncome: number; totalExpense: number; recordCount: number }>();
    list.forEach(r => {
      const month = (r.recordDate || '').slice(0, 7);
      const v = map.get(month) || { totalIncome: 0, totalExpense: 0, recordCount: 0 };
      if (r.categoryType === 'INCOME') v.totalIncome += r.amount; else v.totalExpense += r.amount;
      v.recordCount += 1;
      map.set(month, v);
    });
    const result = Array.from(map.entries()).map(([month, v]) => ({ month, totalIncome: v.totalIncome, totalExpense: v.totalExpense, netAmount: v.totalIncome - v.totalExpense, recordCount: v.recordCount }))
      .sort((a, b) => (a.month as string) < (b.month as string) ? 1 : -1)
      .slice(0, 6);
    return result;
  };

  const computeCategoryStatsFrom = (list: FinancialRecord[], type: 'INCOME' | 'EXPENSE') => {
    const filtered = list.filter(r => r.categoryType === type);
    const map = new Map<string, number>();
    filtered.forEach(r => {
      map.set(r.categoryName, (map.get(r.categoryName) || 0) + r.amount);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    const result = Array.from(map.entries()).map(([categoryName, amount]) => ({
      categoryName,
      amount,
      percentage: Number(((amount / total) * 100).toFixed(2))
    })).sort((a, b) => b.amount - a.amount).slice(0, 8);
    return result;
  };

  const loadReport = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const { start, end } = getEffectiveDates();
      // 概览统计
      try {
        const resp = await api.financialRecords.statistics({ startDate: start, endDate: end });
        const d = resp.data?.data ?? resp.data;
        const totalIncome = Number(d?.totalIncome ?? 0);
        const totalExpense = Number(d?.totalExpense ?? 0);
        const netAmount = Number(d?.netAmount ?? (totalIncome - totalExpense));
        setStats({
          totalIncome,
          totalExpense,
          netAmount,
          recordCount: Number(d?.recordCount ?? 0),
          incomeCount: Number(d?.incomeCount ?? 0),
          expenseCount: Number(d?.expenseCount ?? 0),
          averageIncome: Number(d?.averageIncome ?? 0),
          averageExpense: Number(d?.averageExpense ?? 0),
          topIncomeCategory: d?.topIncomeCategory ?? null,
          topExpenseCategory: d?.topExpenseCategory ?? null,
        });
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
          totalIncome: Number(m.totalIncome ?? m.income ?? 0),
          totalExpense: Number(m.totalExpense ?? m.expense ?? 0),
          netAmount: Number(m.netAmount ?? (Number(m.totalIncome ?? m.income ?? 0) - Number(m.totalExpense ?? m.expense ?? 0))),
          recordCount: Number(m.recordCount ?? 0)
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
        const resp = await api.financialRecords.categoryStatistics({ startDate: start, endDate: end, type: categoryType });
        const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
        const list = (data || []).map((c: any) => ({
          categoryName: c.categoryName ?? '',
          amount: Number(c.amount ?? 0),
          percentage: Number(c.percentage ?? 0)
        }));
        setCategoryStats(list.length ? list.slice(0, 12) : []);
      } catch {
        const recentResp = await api.financialRecords.recent(50);
        const data = Array.isArray(recentResp.data) ? recentResp.data : recentResp.data?.data;
        const list = mapRecords(data || []);
        setCategoryStats(computeCategoryStatsFrom(list, categoryType));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '加载报告失败';
      setError(message);
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

        {/* 日期筛选 */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">日期范围</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-sm text-gray-700 mb-1">开始日期</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">结束日期</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">类型</label>
              <Select value={categoryType} onChange={(e) => setCategoryType(e.target.value as 'INCOME' | 'EXPENSE')}>
                <option value="EXPENSE">支出</option>
                <option value="INCOME">收入</option>
              </Select>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  const today = new Date();
                  setEndDate(formatDate(today));
                  setStartDate(formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)));
                }}
              >近7天</Button>
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  const today = new Date();
                  setEndDate(formatDate(today));
                  setStartDate(formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)));
                }}
              >近30天</Button>
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  const today = new Date();
                  setEndDate(formatDate(today));
                  setStartDate(formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89)));
                }}
              >近90天</Button>
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  const today = new Date();
                  setEndDate(formatDate(today));
                  setStartDate(formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365)));
                }}
              >近一年</Button>
            </div>
            <div>
              <Button type="button" onClick={loadReport} className="text-sm">应用筛选</Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">未设置时默认统计近一年的数据（今天含）。</p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* 统计概览 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">统计概览</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载统计数据..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border">
                <div className="text-sm text-gray-600">收入</div>
                <div className="text-2xl font-bold text-green-700">¥{stats.totalIncome.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border">
                <div className="text-sm text-gray-600">支出</div>
                <div className="text-2xl font-bold text-red-700">¥{stats.totalExpense.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border">
                <div className="text-sm text-gray-600">净值</div>
                <div className="text-2xl font-bold text-blue-700">¥{stats.netAmount.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border">
                <div className="text-sm text-gray-600">记录数</div>
                <div className="text-2xl font-bold text-gray-700">{stats.recordCount ?? 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* 分类统计 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">分类统计（Top 12）</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载分类统计..." />
          ) : categoryStats.length === 0 ? (
            <p className="text-gray-500">暂无分类统计</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryStats.map(cs => (
                <div key={cs.categoryName} className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{cs.categoryName}</span>
                    <span className="text-sm text-gray-700">{cs.percentage.toFixed(2)}%</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">金额 ¥{cs.amount.toFixed(2)}</div>
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
                  <div className="text-sm text-gray-600 mt-1">收入 ¥{ms.totalIncome.toFixed(2)} | 支出 ¥{ms.totalExpense.toFixed(2)}</div>
                  <div className={`text-sm mt-1 ${ms.netAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>净值 ¥{ms.netAmount.toFixed(2)}</div>
                  {typeof ms.recordCount === 'number' && (
                    <div className="text-xs text-gray-500 mt-1">记录数 {ms.recordCount}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}