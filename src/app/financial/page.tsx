'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    recordDate: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    location: ''
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchCategories();
    fetchRecords();
  }, [user, authLoading, router]);

  const fetchCategories = async () => {
    try {
      // 这里应该调用实际的API，暂时使用模拟数据
      const mockCategories: Category[] = [
        { id: 1, name: '餐饮', type: 'EXPENSE', iconName: 'restaurant', colorCode: '#FF5722' },
        { id: 2, name: '交通', type: 'EXPENSE', iconName: 'directions_car', colorCode: '#2196F3' },
        { id: 3, name: '购物', type: 'EXPENSE', iconName: 'shopping_cart', colorCode: '#4CAF50' },
        { id: 4, name: '娱乐', type: 'EXPENSE', iconName: 'movie', colorCode: '#9C27B0' },
        { id: 5, name: '工资', type: 'INCOME', iconName: 'work', colorCode: '#FF9800' },
        { id: 6, name: '奖金', type: 'INCOME', iconName: 'card_giftcard', colorCode: '#795548' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('获取分类失败:', error);
      setMessage({ type: 'error', text: '获取分类失败' });
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // 这里应该调用实际的API，暂时使用模拟数据
      const mockRecords: FinancialRecord[] = [
        {
          id: 1,
          categoryId: 1,
          categoryName: '餐饮',
          categoryType: 'EXPENSE',
          amount: 50.00,
          recordDate: '2024-01-01',
          description: '午餐',
          paymentMethod: '支付宝'
        }
      ];
      setRecords(mockRecords);
    } catch (error) {
      console.error('获取记录失败:', error);
      setMessage({ type: 'error', text: '获取记录失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.amount) {
      setMessage({ type: 'error', text: '请填写必填项' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 这里应该调用实际的API
      const newRecord: FinancialRecord = {
        id: Date.now(),
        categoryId: parseInt(formData.categoryId),
        categoryName: categories.find(c => c.id === parseInt(formData.categoryId))?.name || '',
        categoryType: categories.find(c => c.id === parseInt(formData.categoryId))?.type || 'EXPENSE',
        amount: parseFloat(formData.amount),
        recordDate: formData.recordDate,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        location: formData.location
      };

      setRecords(prev => [newRecord, ...prev]);
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
      console.error('添加记录失败:', error);
      setMessage({ type: 'error', text: '添加记录失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner text="正在验证身份..." />;
  }

  return (
    <Layout showNavigation>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">记账系统</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showAddForm ? '取消' : '添加记录'}
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类 *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">请选择分类</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.type === 'INCOME' ? '收入' : '支出'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    金额 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支付方式
                  </label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：支付宝、微信、现金"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="记录描述"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? '添加中...' : '添加记录'}
                </button>
              </div>
            </form>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近记录</h3>
            {loading && records.length === 0 ? (
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
  );
}