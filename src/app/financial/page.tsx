'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { DatePicker } from '@/components/ui/date-picker';
import Select from '@/components/Select';
import AddCategoryModal from '@/components/AddCategoryModal';
import ImportBillsModal from '@/components/ImportBillsModal';

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  iconName?: string;
  colorCode?: string;
}

interface FinancialRecord {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  amount: number;
  recordDate: string;
  description?: string;
  paymentMethod?: string;
  location?: string;
}

export default function FinancialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = '/financial';
  const [categories, setCategories] = useState<Category[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // 筛选/搜索状态
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    type: 'ALL' as 'ALL' | 'INCOME' | 'EXPENSE',
    keyword: ''
  });

  // 统计状态
  const [stats, setStats] = useState<{ income: number; expense: number; net: number }>({ income: 0, expense: 0, net: 0 });
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string; income: number; expense: number; net: number }>>([]);
  const [categoryStats, setCategoryStats] = useState<Array<{ categoryId: number; categoryName: string; income: number; expense: number; net: number }>>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    fetchCategories();
    fetchRecords();
  }, [authLoading, user, router]);

  const mapRecords = (data: any[]): FinancialRecord[] => {
    return (data || []).map((r: any) => ({
      id: Number(r.id ?? Date.now()),
      categoryId: Number(r.categoryId ?? 0),
      categoryName: r.categoryName ?? '',
      categoryType: (r.categoryType ?? r.type ?? 'EXPENSE') as 'INCOME' | 'EXPENSE',
      amount: Number(r.amount ?? 0),
      recordDate: r.recordDate ?? r.date ?? new Date().toISOString().split('T')[0],
      description: r.description ?? r.remark ?? '',
      paymentMethod: r.paymentMethod ?? r.method ?? '',
    }));
  };

  const fetchCategories = async () => {
    try {
      const resp = await api.categories.list();
      const raw = resp.data;
      const data = Array.isArray(raw) ? raw : raw?.data;
      const list: Category[] = (data || []).map((c: any) => ({
        id: Number(c.id ?? c.categoryId ?? 0),
        name: c.name ?? c.categoryName ?? '',
        type: (c.type ?? c.categoryType ?? 'EXPENSE') as 'INCOME' | 'EXPENSE',
        iconName: c.iconName,
        colorCode: c.colorCode,
      }));
      if (list.length === 0) {
        const mockCategories: Category[] = [
          { id: 1, name: '餐饮', type: 'EXPENSE', iconName: 'restaurant', colorCode: '#FF5722' },
          { id: 2, name: '交通', type: 'EXPENSE', iconName: 'directions_car', colorCode: '#2196F3' },
          { id: 5, name: '工资', type: 'INCOME', iconName: 'work', colorCode: '#FF9800' },
        ];
        setCategories(mockCategories);
      } else {
        setCategories(list);
      }
    } catch (error) {
      const mockCategories: Category[] = [
        { id: 1, name: '餐饮', type: 'EXPENSE', iconName: 'restaurant', colorCode: '#FF5722' },
        { id: 2, name: '交通', type: 'EXPENSE', iconName: 'directions_car', colorCode: '#2196F3' },
        { id: 5, name: '工资', type: 'INCOME', iconName: 'work', colorCode: '#FF9800' },
      ];
      setCategories(mockCategories);
      setMessage({ type: 'error', text: '获取分类失败，已使用本地数据' });
    }
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
      .sort((a, b) => a.month < b.month ? 1 : -1);
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

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const loadStats = async (source?: FinancialRecord[]) => {
    setStatsLoading(true);
    try {
      // 总览统计
      try {
        const resp = await api.financialRecords.statistics();
        const d = resp.data?.data ?? resp.data;
        const income = Number(d?.incomeTotal ?? d?.income ?? 0);
        const expense = Number(d?.expenseTotal ?? d?.expense ?? 0);
        setStats({ income, expense, net: income - expense });
      } catch {
        const computed = computeStatsFrom(source ?? records);
        setStats(computed);
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
        setMonthlyStats(list.length ? list : computeMonthlyStatsFrom(source ?? records));
      } catch {
        setMonthlyStats(computeMonthlyStatsFrom(source ?? records));
      }

      // 分类统计（并行拉取 INCOME/EXPENSE，并在前端合并）
      try {
        // 优先使用筛选条件；若缺失则根据当前数据范围或默认近30天推导
        const today = new Date();
        const defaultEnd = formatDate(today);
        const defaultStart = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29));
        let start = (filters.startDate || '').trim();
        let end = (filters.endDate || '').trim();

        if (!start || !end) {
          const base = (source ?? records) || [];
          if (base.length) {
            const sortedDates = base
              .map(r => r.recordDate)
              .filter(Boolean)
              .sort();
            const minDate = sortedDates[0];
            const maxDate = sortedDates[sortedDates.length - 1];
            start = start || minDate || defaultStart;
            end = end || maxDate || defaultEnd;
          } else {
            // 无数据时使用默认的近30天范围
            start = start || defaultStart;
            end = end || defaultEnd;
          }
        }

        const baseParams = { startDate: start, endDate: end };

        // 若用户筛选了单一类型，则只需命中该类型；否则默认双请求并合并
        if (filters.type === 'INCOME') {
          const resp = await api.financialRecords.categoryStatistics({ ...baseParams, type: 'INCOME' });
          const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
          const onlyIncome: Array<{ categoryId: number; categoryName: string; income: number; expense: number; net: number }> = (data || []).map((c: any) => ({
            categoryId: Number(c.categoryId ?? c.id ?? 0),
            categoryName: c.categoryName ?? c.name ?? '',
            income: Number(c.totalAmount ?? c.amount ?? c.incomeTotal ?? c.income ?? 0),
            expense: 0,
            net: Number(c.totalAmount ?? c.amount ?? c.incomeTotal ?? c.income ?? 0),
          }));
          setCategoryStats(onlyIncome.length ? onlyIncome.sort((a, b) => (b.income + b.expense) - (a.income + a.expense)).slice(0, 8) : computeCategoryStatsFrom(source ?? records));
        } else if (filters.type === 'EXPENSE') {
          const resp = await api.financialRecords.categoryStatistics({ ...baseParams, type: 'EXPENSE' });
          const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
          const onlyExpense: Array<{ categoryId: number; categoryName: string; income: number; expense: number; net: number }> = (data || []).map((c: any) => ({
            categoryId: Number(c.categoryId ?? c.id ?? 0),
            categoryName: c.categoryName ?? c.name ?? '',
            income: 0,
            expense: Number(c.totalAmount ?? c.amount ?? c.expenseTotal ?? c.expense ?? 0),
            net: -Number(c.totalAmount ?? c.amount ?? c.expenseTotal ?? c.expense ?? 0),
          }));
          setCategoryStats(onlyExpense.length ? onlyExpense.sort((a, b) => (b.income + b.expense) - (a.income + a.expense)).slice(0, 8) : computeCategoryStatsFrom(source ?? records));
        } else {
          const [incomeResp, expenseResp] = await Promise.all([
            api.financialRecords.categoryStatistics({ ...baseParams, type: 'INCOME' }),
            api.financialRecords.categoryStatistics({ ...baseParams, type: 'EXPENSE' }),
          ]);

          const incomeData = Array.isArray(incomeResp.data) ? incomeResp.data : incomeResp.data?.data;
          const expenseData = Array.isArray(expenseResp.data) ? expenseResp.data : expenseResp.data?.data;

          const merged = new Map<number, { categoryId: number; categoryName: string; income: number; expense: number; net: number }>();

          (incomeData || []).forEach((c: any) => {
            const id = Number(c.categoryId ?? c.id ?? 0);
            const name = c.categoryName ?? c.name ?? '';
            const amount = Number(c.totalAmount ?? c.amount ?? c.incomeTotal ?? c.income ?? 0);
            const cur = merged.get(id) || { categoryId: id, categoryName: name, income: 0, expense: 0, net: 0 };
            cur.categoryName = cur.categoryName || name;
            cur.income += amount;
            cur.net = cur.income - cur.expense;
            merged.set(id, cur);
          });

          (expenseData || []).forEach((c: any) => {
            const id = Number(c.categoryId ?? c.id ?? 0);
            const name = c.categoryName ?? c.name ?? '';
            const amount = Number(c.totalAmount ?? c.amount ?? c.expenseTotal ?? c.expense ?? 0);
            const cur = merged.get(id) || { categoryId: id, categoryName: name, income: 0, expense: 0, net: 0 };
            cur.categoryName = cur.categoryName || name;
            cur.expense += amount;
            cur.net = cur.income - cur.expense;
            merged.set(id, cur);
          });

          const list = Array.from(merged.values()).sort((a, b) => (b.expense + b.income) - (a.expense + a.income)).slice(0, 8);
          setCategoryStats(list.length ? list : computeCategoryStatsFrom(source ?? records));
        }
      } catch {
        setCategoryStats(computeCategoryStatsFrom(source ?? records));
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setRecordsLoading(true);
      const resp = await api.financialRecords.recent(10);
      const raw = resp.data;
      const data = Array.isArray(raw) ? raw : raw?.data;
      const list = mapRecords(data || []);
      if (list.length === 0) {
        const mockRecords: FinancialRecord[] = [
          { id: 1, categoryId: 1, categoryName: '餐饮', categoryType: 'EXPENSE', amount: 50.0, recordDate: '2024-01-01', description: '午餐', paymentMethod: '支付宝' },
          { id: 2, categoryId: 5, categoryName: '工资', categoryType: 'INCOME', amount: 8000.0, recordDate: '2024-01-05', description: '一月工资' },
          { id: 3, categoryId: 2, categoryName: '交通', categoryType: 'EXPENSE', amount: 12.5, recordDate: '2024-01-07', description: '地铁' },
        ];
        setRecords(mockRecords);
        await loadStats(mockRecords);
      } else {
        setRecords(list);
      }
    } catch (error) {
      const mockRecords: FinancialRecord[] = [
        { id: 1, categoryId: 1, categoryName: '餐饮', categoryType: 'EXPENSE', amount: 50.0, recordDate: '2024-01-01', description: '午餐', paymentMethod: '支付宝' },
        { id: 2, categoryId: 5, categoryName: '工资', categoryType: 'INCOME', amount: 8000.0, recordDate: '2024-01-05', description: '一月工资' },
        { id: 3, categoryId: 2, categoryName: '交通', categoryType: 'EXPENSE', amount: 12.5, recordDate: '2024-01-07', description: '地铁' },
      ];
      setRecords(mockRecords);
      setMessage({ type: 'error', text: '获取记录失败，已使用本地数据' });
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleQuery = async () => {
    try {
      setRecordsLoading(true);
      let list: FinancialRecord[] = [];

      if (filters.keyword) {
        try {
          const resp = await api.financialRecords.search(filters.keyword);
          const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
          list = mapRecords(data || []);
        } catch {
          // 本地降级搜索
          const src = records.length ? records : [];
          const kw = filters.keyword.toLowerCase();
          list = src.filter(r => (
            r.categoryName.toLowerCase().includes(kw) ||
            (r.description || '').toLowerCase().includes(kw) ||
            (r.paymentMethod || '').toLowerCase().includes(kw)
          ));
        }
      } else if (filters.startDate || filters.endDate) {
        try {
          const resp = await api.financialRecords.getByDateRange(filters.startDate!, filters.endDate!);
          const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
          list = mapRecords(data || []);
        } catch {
          // 本地降级筛选
          const src = records.length ? records : [];
          list = src.filter(r => {
            const inStart = !filters.startDate || r.recordDate >= filters.startDate;
            const inEnd = !filters.endDate || r.recordDate <= filters.endDate;
            const matchCat = !filters.categoryId || r.categoryId === Number(filters.categoryId);
            const matchType = filters.type === 'ALL' || r.categoryType === filters.type;
            return inStart && inEnd && matchCat && matchType;
          });
        }
      } else if (filters.categoryId) {
        try {
          const resp = await api.financialRecords.getByCategory(Number(filters.categoryId));
          const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
          list = mapRecords(data || []);
          if (filters.type !== 'ALL') list = list.filter(r => r.categoryType === filters.type);
        } catch {
          const src = records.length ? records : [];
          list = src.filter(r => r.categoryId === Number(filters.categoryId) && (filters.type === 'ALL' || r.categoryType === filters.type));
        }
      } else {
        const resp = await api.financialRecords.recent(10);
        const data = Array.isArray(resp.data) ? resp.data : resp.data?.data;
        list = mapRecords(data || []);
      }

      if (!list.length) {
        // 保底提示
        setMessage({ type: 'error', text: '查询结果为空，已保留当前列表' });
      } else {
        setRecords(list);
        await loadStats(list);
        setMessage(null);
      }
    } catch (e) {
      setMessage({ type: 'error', text: '查询失败，请稍后重试' });
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', categoryId: '', type: 'ALL', keyword: '' });
    fetchRecords();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount) {
      setMessage({ type: 'error', text: '请填写必填项' });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId, 10),
        description: formData.description || undefined,
        recordDate: formData.recordDate,
        tags: undefined,
      };
      const resp = await api.financialRecords.create(payload);
      const r = resp.data?.data ?? resp.data;
      const newRecord: FinancialRecord = {
        id: Number(r?.id ?? Date.now()),
        categoryId: payload.categoryId,
        categoryName: r?.categoryName ?? (categories.find(c => c.id === payload.categoryId)?.name || ''),
        categoryType: r?.categoryType ?? (categories.find(c => c.id === payload.categoryId)?.type || 'EXPENSE'),
        amount: payload.amount,
        recordDate: payload.recordDate,
        description: payload.description,
      };

      const next = [newRecord, ...records].slice(0, 10);
      setRecords(next);
      setMessage({ type: 'success', text: '记录添加成功！' });
      setShowAddForm(false);
      setFormData({
        categoryId: '',
        amount: '',
        recordDate: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: '',
        location: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: '添加记录失败，请检查登录或稍后重试' });
    } finally {
      setSubmitLoading(false);
    }
  };

  // 表单状态
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    recordDate: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    location: ''
  });

  const handleCategoryCreated = (created: { id: number; name: string; type: 'INCOME' | 'EXPENSE'; iconName?: string; colorCode?: string }) => {
    setCategories(prev => {
      const exists = prev.some(c => c.id === created.id)
      const next = exists ? prev.map(c => (c.id === created.id ? { ...c, ...created } : c)) : [...prev, created]
      return next
    })
    setFormData(prev => ({ ...prev, categoryId: String(created.id) }))
    setMessage({ type: 'success', text: '分类创建成功！' })
  }

  return (
    <>
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCreated={handleCategoryCreated}
      />
      <ImportBillsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={async (msg?: string) => {
          // 导入后按照当前筛选条件增量刷新
          await handleQuery();
          // 保留成功提示
          setMessage({ type: 'success', text: msg || '导入成功！' });
        }}
      />
      <Layout showNavigation>
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">记账系统</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddForm(true)} variant="primary" className="text-sm">
                添加记录
              </Button>
              <Button onClick={() => setShowImportModal(true)} variant="secondary" className="text-sm">
                导入账单
              </Button>
              <Button onClick={() => router.push('/financial/report')} variant="secondary" className="text-sm">
                查看报告
              </Button>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* 筛选与搜索 */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">筛选与搜索</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <DatePicker
                  value={filters.startDate}
                  onChange={(v) => setFilters(prev => ({ ...prev, startDate: v }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <DatePicker
                  value={filters.endDate}
                  onChange={(v) => setFilters(prev => ({ ...prev, endDate: v }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <Select
                  value={filters.categoryId}
                  onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                  fullWidth
                  searchable
                  searchPlaceholder="搜索分类..."
                  noResultsText="无匹配分类"
                >
                  <option value="">全部</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'ALL' | 'INCOME' | 'EXPENSE' }))}
                  fullWidth
                >
                  <option value="ALL">全部</option>
                  <option value="INCOME">收入</option>
                  <option value="EXPENSE">支出</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
                <Input
                   type="text"
                   value={filters.keyword}
                   onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                   placeholder="描述、支付方式、分类名"
                   fullWidth
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleQuery} variant="primary" className="text-sm">查询</Button>
              <Button onClick={handleResetFilters} variant="secondary" className="text-sm">重置</Button>
            </div>
          </div>

          {/* 统计概览 */}
          <div className="mb-6 hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">统计概览</h3>
            {statsLoading ? (
              <LoadingSpinner text="计算统计中..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-50 border shadow-sm transition duration-150 ease-out hover:-translate-y-[1px] hover:shadow-md">
                  <div className="text-sm text-gray-600">收入</div>
                  <div className="text-2xl font-bold text-green-700">¥{stats.income.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border shadow-sm transition duration-150 ease-out hover:-translate-y-[1px] hover:shadow-md">
                  <div className="text-sm text-gray-600">支出</div>
                  <div className="text-2xl font-bold text-red-700">¥{stats.expense.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border shadow-sm transition duration-150 ease-out hover:-translate-y-[1px] hover:shadow-md">
                  <div className="text-sm text-gray-600">净值</div>
                  <div className="text-2xl font-bold text-blue-700">¥{stats.net.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>

          {/* 分类统计 */}
          <div className="mb-6 hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">分类统计（Top 8）</h3>
            {statsLoading ? (
              <LoadingSpinner text="加载分类统计..." />
            ) : categoryStats.length === 0 ? (
              <p className="text-gray-500">暂无分类统计</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryStats.map(cs => (
                  <div key={cs.categoryId} className="border rounded-lg p-3 bg-gray-50 shadow-sm transition duration-150 ease-out hover:-translate-y-[1px] hover:shadow-md hover:bg-gray-100">
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
          <div className="mb-6 hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">月度统计</h3>
            {statsLoading ? (
              <LoadingSpinner text="加载月度统计..." />
            ) : monthlyStats.length === 0 ? (
              <p className="text-gray-500">暂无月度统计</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {monthlyStats.map(ms => (
                  <div key={ms.month} className="border rounded-lg p-3 bg-gray-50 shadow-sm transition duration-150 ease-out hover:-translate-y-[1px] hover:shadow-md hover:bg-gray-100">
                    <div className="font-medium text-gray-900">{ms.month}</div>
                    <div className="text-sm text-gray-600 mt-1">收入 ¥{ms.income.toFixed(2)} | 支出 ¥{ms.expense.toFixed(2)}</div>
                    <div className={`text-sm mt-1 ${ms.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>净值 ¥{ms.net.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__add__') {
                        // 打开新增分类弹窗
                        setShowAddCategoryModal(true)
                        return
                      }
                      setFormData(prev => ({ ...prev, categoryId: val }))
                    }}
                    fullWidth
                    required
                    searchable
                    searchPlaceholder="搜索分类..."
                    noResultsText="无匹配分类"
                  >
                    <option value="">请选择分类</option>
                    {categories.map(category => (
                      <option
                        key={category.id}
                        value={category.id}
                        data-icon={category.iconName}
                        data-color={category.colorCode}
                        data-label={`${category.name} (${category.type === 'INCOME' ? '收入' : '支出'})`}
                      >
                        {`${category.name} (${category.type === 'INCOME' ? '收入' : '支出'})`}
                      </option>
                    ))}
                    <option value="__add__">＋ 新建分类...</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金额 *</label>
                  <Input
                     type="number"
                     step="0.01"
                     min="0"
                     value={formData.amount}
                     onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                     fullWidth

                     placeholder="0.00"
                     required
                   />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <Input
                     type="date"
                     value={formData.recordDate}
                     onChange={(e) => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
                     fullWidth

                   />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">支付方式</label>
                  <Input
                     type="text"
                     value={formData.paymentMethod}
                     onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                     fullWidth

                     placeholder="如：支付宝、微信、现金"
                   />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <Input
                     type="text"
                     value={formData.description}
                     onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                     fullWidth

                     placeholder="记录描述"
                   />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={submitLoading}
                  variant="primary"
                >
                  {submitLoading ? '添加中...' : '添加记录'}
                </Button>
              </div>
            </form>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近记录（前10条）</h3>
            {recordsLoading && records.length === 0 ? (
              <LoadingSpinner text="加载记录中..." />
            ) : records.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无记录</p>
            ) : (
              <div className="space-y-3">
                {records.map(record => (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.categoryType === 'INCOME' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.categoryName}
                          </span>
                          <span className="text-sm text-gray-500">{record.recordDate}</span>
                        </div>
                        {record.description && (
                          <p className="text-gray-700 mb-1">{record.description}</p>
                        )}
                        {record.paymentMethod && (
                          <p className="text-sm text-gray-500">支付方式: {record.paymentMethod}</p>
                        )}
                      </div>
                      <div className={`text-lg font-semibold ${
                        record.categoryType === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.categoryType === 'INCOME' ? '+' : '-'}¥{record.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
}
