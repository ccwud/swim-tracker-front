'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { DatePicker } from '@/components/ui/date-picker';
import Select from '@/components/Select';
import Pagination from '@/components/Pagination';

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
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string; totalIncome: number; totalExpense: number; netAmount: number; recordCount?: number }>>([]);
  const [categoryIncomeStats, setCategoryIncomeStats] = useState<Array<{ categoryId: number; categoryName: string; amount: number; percentage: number }>>([]);
  const [categoryExpenseStats, setCategoryExpenseStats] = useState<Array<{ categoryId: number; categoryName: string; amount: number; percentage: number }>>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryType, setCategoryType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // 前端分页（每类各自分页）
  const [incomePage, setIncomePage] = useState<number>(0);
  const [incomePageSize, setIncomePageSize] = useState<number>(10);
  const [expensePage, setExpensePage] = useState<number>(0);
  const [expensePageSize, setExpensePageSize] = useState<number>(10);

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
      .sort((a, b) => (a.month as string) < (b.month as string) ? 1 : -1);
    return result;
  };

  const computeCategoryStatsByTypeFrom = (list: FinancialRecord[], type: 'INCOME' | 'EXPENSE') => {
    const filtered = list.filter(r => r.categoryType === type);
    const map = new Map<number, { name: string; amount: number }>();
    filtered.forEach(r => {
      const prev = map.get(r.categoryId) || { name: r.categoryName, amount: 0 };
      map.set(r.categoryId, { name: prev.name || r.categoryName, amount: prev.amount + r.amount });
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v.amount, 0) || 1;
    const result = Array.from(map.entries()).map(([categoryId, v]) => ({
      categoryId: Number(categoryId),
      categoryName: v.name,
      amount: v.amount,
      percentage: Number(((v.amount / total) * 100).toFixed(2))
    })).sort((a, b) => b.amount - a.amount);
    return result;
  };

  // 根据后端新结构，前端兜底分别计算收入/支出分类统计（不截断）
  const computeCategoryIncomeStatsFrom = (list: FinancialRecord[]) => computeCategoryStatsByTypeFrom(list, 'INCOME');
  const computeCategoryExpenseStatsFrom = (list: FinancialRecord[]) => computeCategoryStatsByTypeFrom(list, 'EXPENSE');

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
        const list = (data || []).map((m: any) => {
          const y = Number(m.year ?? m.y ?? m.yr);
          const mo = Number(m.month);
          const fromYearMonth = y && mo ? `${y}-${String(mo).padStart(2, '0')}` : '';
          const rawPeriod = (m.period ?? m.time ?? m.label ?? m.date ?? '').toString();
          const rawMonth = (m.month ?? '').toString();
          const monthLabel = fromYearMonth || rawPeriod || rawMonth;
          return {
            month: monthLabel,
            totalIncome: Number(m.totalIncome ?? m.incomeTotal ?? m.income ?? 0),
            totalExpense: Number(m.totalExpense ?? m.expenseTotal ?? m.expense ?? 0),
            netAmount: Number(
              m.netAmount ?? m.netTotal ?? (
                Number(m.totalIncome ?? m.incomeTotal ?? m.income ?? 0) -
                Number(m.totalExpense ?? m.expenseTotal ?? m.expense ?? 0)
              )
            ),
            recordCount: Number(m.recordCount ?? 0),
          };
        });
        setMonthlyStats(list.length ? list : []);
      } catch {
        const recentResp = await api.financialRecords.recent(50);
        const data = Array.isArray(recentResp.data) ? recentResp.data : recentResp.data?.data;
        const list = mapRecords(data || []);
        setMonthlyStats(computeMonthlyStatsFrom(list));
      }

      // 分类统计：支持 ALL/INCOME/EXPENSE，渲染收入与支出分栏
      try {
        const params = categoryType === 'ALL'
          ? { startDate: start, endDate: end }
          : { startDate: start, endDate: end, type: categoryType };
        const resp = await api.financialRecords.categoryStatistics(params);
        const payload = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? resp.data);

        // 新接口结构：{ incomeStatistics: [...], expenseStatistics: [...] }
        const incomeRaw = (payload && typeof payload === 'object' && 'incomeStatistics' in payload)
          ? (payload as any).incomeStatistics
          : (Array.isArray(payload) && categoryType === 'INCOME') ? payload : [];
        const expenseRaw = (payload && typeof payload === 'object' && 'expenseStatistics' in payload)
          ? (payload as any).expenseStatistics
          : (Array.isArray(payload) && categoryType === 'EXPENSE') ? payload : [];

        const incomeList = (incomeRaw || []).map((c: any) => ({
          categoryId: Number(c.categoryId ?? 0),
          categoryName: c.categoryName ?? '',
          amount: Number(c.amount ?? c.totalAmount ?? 0),
          percentage: Number(c.percentage ?? 0),
        }));
        const expenseList = (expenseRaw || []).map((c: any) => ({
          categoryId: Number(c.categoryId ?? 0),
          categoryName: c.categoryName ?? '',
          amount: Number(c.amount ?? c.totalAmount ?? 0),
          percentage: Number(c.percentage ?? 0),
        }));

        setCategoryIncomeStats(incomeList);
        setCategoryExpenseStats(expenseList);

        // 数据变更时重置分页
        setIncomePage(0);
        setExpensePage(0);
      } catch {
        const recentResp = await api.financialRecords.recent(100);
        const data = Array.isArray(recentResp.data) ? recentResp.data : recentResp.data?.data;
        const list = mapRecords(data || []);
        setCategoryIncomeStats(computeCategoryIncomeStatsFrom(list));
        setCategoryExpenseStats(computeCategoryExpenseStatsFrom(list));
        setIncomePage(0);
        setExpensePage(0);
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
              <DatePicker value={startDate} onChange={(v) => setStartDate(v)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">结束日期</label>
              <DatePicker value={endDate} onChange={(v) => setEndDate(v)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">类型</label>
              <Select value={categoryType} onChange={(e) => setCategoryType(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}>
                <option value="ALL">全部</option>
                <option value="INCOME">收入</option>
                <option value="EXPENSE">支出</option>
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

        {/* 分类统计（收入/支出分栏，前端分页，每页10条可调） */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">分类统计</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载分类统计..." />
          ) : (
            <>
              {(categoryType === 'ALL' || categoryType === 'INCOME') && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-800">收入分类</h4>
                  </div>
                  {categoryIncomeStats.length === 0 ? (
                    <p className="text-gray-500">暂无收入分类统计</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryIncomeStats.slice(incomePage * incomePageSize, incomePage * incomePageSize + incomePageSize).map(cs => (
                          <CategoryStatCard key={`income-${cs.categoryId || cs.categoryName}`} stat={cs} type="INCOME" />
                        ))}
                      </div>
                      <Pagination
                        page={incomePage}
                        pageSize={incomePageSize}
                        totalPages={Math.max(Math.ceil((categoryIncomeStats.length || 0) / (incomePageSize || 10)), 1)}
                        totalElements={categoryIncomeStats.length}
                        onPageChange={(p) => setIncomePage(p)}
                        onPageSizeChange={(sz) => { setIncomePageSize(sz); setIncomePage(0); }}
                      />
                    </>
                  )}
                </div>
              )}

              {(categoryType === 'ALL' || categoryType === 'EXPENSE') && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-800">支出分类</h4>
                  </div>
                  {categoryExpenseStats.length === 0 ? (
                    <p className="text-gray-500">暂无支出分类统计</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryExpenseStats.slice(expensePage * expensePageSize, expensePage * expensePageSize + expensePageSize).map(cs => (
                          <CategoryStatCard key={`expense-${cs.categoryId || cs.categoryName}`} stat={cs} type="EXPENSE" />
                        ))}
                      </div>
                      <Pagination
                        page={expensePage}
                        pageSize={expensePageSize}
                        totalPages={Math.max(Math.ceil((categoryExpenseStats.length || 0) / (expensePageSize || 10)), 1)}
                        totalElements={categoryExpenseStats.length}
                        onPageChange={(p) => setExpensePage(p)}
                        onPageSizeChange={(sz) => { setExpensePageSize(sz); setExpensePage(0); }}
                      />
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 月度统计 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">月度统计</h3>
          {statsLoading ? (
            <LoadingSpinner text="加载月度统计..." />
          ) : monthlyStats.length === 0 ? (
            <p className="text-gray-500">暂无月度统计</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {monthlyStats.map(ms => (
                <MonthStatCard key={ms.month} stat={ms} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// 可点击的分类统计卡片，点击跳转到分类分页明细
function CategoryStatCard({ stat, type }: { stat: { categoryId: number; categoryName: string; amount: number; percentage: number }; type: 'INCOME' | 'EXPENSE' }) {
  const router = useRouter();
  const handleClick = () => {
    if (!stat.categoryId) return;
    router.push(`/financial/category?id=${stat.categoryId}&categoryName=${encodeURIComponent(stat.categoryName)}`);
  };
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      className="cursor-pointer select-none bg-white text-left transition duration-150 ease-out hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium text-gray-900">{stat.categoryName}</CardTitle>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{type === 'INCOME' ? '收入' : '支出'}</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-sm text-gray-600 mt-1">占比 {stat.percentage.toFixed(2)}%</div>
        <div className="text-sm text-gray-600 mt-1">金额 ¥{stat.amount.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}

// 可点击的月度统计卡片，点击跳转到按月详情列表
function MonthStatCard({ stat }: { stat: { month: string; totalIncome: number; totalExpense: number; netAmount: number; recordCount?: number } }) {
  const router = useRouter();

  const handleClick = () => {
    const label = (stat.month || '').trim();
    let year: number | null = null;
    let month: number | null = null;

    // 1) 直接匹配“YYYY-?MM”或“YYYY年MM月”等格式
    const m1 = label.match(/(\d{4}).*?(\d{1,2})/);
    if (m1) {
      year = Number(m1[1]);
      month = Number(m1[2]);
    } else if (label.includes('-')) {
      // 2) 简单的以 - 分隔
      const [y, mo] = label.split('-');
      const yNum = Number(y);
      const mNum = Number(mo);
      if (yNum && mNum) { year = yNum; month = mNum; }
    } else if (/^\d{1,2}$/.test(label)) {
      // 3) 仅只有月份数字，年份取当前年
      year = new Date().getFullYear();
      month = Number(label);
    }

    if (!year || !month) {
      // 无法解析则不跳转，以免进入空页面
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const start = fmt(startDate);
    const end = fmt(endDate);
    router.push(`/financial/date-range?month=${encodeURIComponent(stat.month)}&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      className="cursor-pointer select-none bg-gray-50 text-left transition duration-150 ease-out hover:-translate-y-[1px] hover:bg-gray-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <CardContent className="p-3">
        <div className="font-medium text-gray-900">{stat.month}</div>
        <div className="text-sm text-gray-600 mt-1">收入 ¥{stat.totalIncome.toFixed(2)} | 支出 ¥{stat.totalExpense.toFixed(2)}</div>
        <div className={`text-sm mt-1 ${stat.netAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>净值 ¥{stat.netAmount.toFixed(2)}</div>
        {typeof stat.recordCount === 'number' && (
          <div className="text-xs text-gray-500 mt-1">记录数 {stat.recordCount}</div>
        )}
      </CardContent>
    </Card>
  );
}