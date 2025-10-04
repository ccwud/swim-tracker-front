'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ReportData, WeeklyReport, MonthlyReport, SwimmingRecord } from '@/types';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

type ReportType = 'weekly' | 'monthly' | 'all';

export default function Report() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 等待认证状态加载完成后再进行判断
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (reportType === 'weekly') {
        response = await api.getWeeklyStats();
      } else if (reportType === 'monthly') {
        response = await api.getMonthlyStats();
      } else {
        // 获取所有记录 - 修复API调用名称
        response = await api.getRecords();
      }
      
      // 根据API文档，直接使用响应数据
      if (reportType === 'all') {
        // 对于全部记录，构造统计数据
        const records = response.data;
        const totalSessions = records.length;
        const totalMeters = records.reduce((sum: number, record: any) => sum + record.distanceMeters, 0);
        const averageMetersPerSession = totalSessions > 0 ? Math.round(totalMeters / totalSessions) : 0;
        
        setReportData({
          interval: reportType,
          statistics: {
            totalSessions,
            totalMeters,
            averageMetersPerSession
          },
          records: records.map((record: any) => ({
            date: new Date(record.recordDate || record.createdAt).toLocaleDateString('zh-CN'),
            rounds: record.rounds,
            meters: record.distanceMeters
          }))
        });
      } else {
        // 对于周报告和月报告，使用统计数据
        const stats = Array.isArray(response.data) ? response.data : [response.data];
        const totalSessions = stats.reduce((sum: number, stat: any) => sum + (stat.totalRecords || 0), 0);
        const totalMeters = stats.reduce((sum: number, stat: any) => sum + (stat.totalDistance || 0), 0);
        const averageMetersPerSession = totalSessions > 0 ? Math.round(totalMeters / totalSessions) : 0;
        
        setReportData({
          interval: reportType,
          statistics: {
            totalSessions,
            totalMeters,
            averageMetersPerSession
          },
          records: [],
          weeklyReports: reportType === 'weekly' ? stats.map((stat: any) => ({
            week: `${stat.year}年第${stat.week}周`,
            weekStart: '',
            weekEnd: '',
            sessions: stat.totalRecords || 0,
            totalMeters: stat.totalDistance || 0
          })) : [],
          monthlyReports: reportType === 'monthly' ? stats.map((stat: any) => ({
            month: `${stat.year}年${stat.month}月`,
            year: stat.year?.toString(),
            sessions: stat.totalRecords || 0,
            totalMeters: stat.totalDistance || 0
          })) : []
        });
      }
    } catch (error: any) {
      console.error('获取报告失败:', error);
      let errorMessage = '获取报告失败，请重试';
      
      if (error.response) {
        // 服务器响应了错误状态码
        errorMessage = error.response.data?.message || error.response.data || errorMessage;
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络连接失败，请检查网络连接';
      } else {
        // 其他错误
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    setReportData(null);
  };

  const renderStatistics = () => {
    if (!reportData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">总打卡次数</h3>
          <p className="text-2xl font-bold text-blue-900">{reportData.statistics.totalSessions}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">总游泳距离</h3>
          <p className="text-2xl font-bold text-green-900">{reportData.statistics.totalMeters} 米</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">平均每次距离</h3>
          <p className="text-2xl font-bold text-purple-900">
            {reportData.statistics.averageMetersPerSession} 米
          </p>
        </div>
      </div>
    );
  };

  const renderWeeklyReport = (weeklyData: WeeklyReport[]) => {
    if (weeklyData.length === 0) {
      return <p className="text-gray-500 text-center py-8">暂无周报告数据</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                周期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                打卡次数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总距离 (米)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平均距离 (米)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {weeklyData.map((week, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.weekStart} 至 {week.weekEnd}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.sessions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.totalMeters}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.sessions > 0 ? Math.round(week.totalMeters / week.sessions) : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonthlyReport = (monthlyData: MonthlyReport[]) => {
    if (monthlyData.length === 0) {
      return <p className="text-gray-500 text-center py-8">暂无月报告数据</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                月份
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                打卡次数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总距离 (米)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平均距离 (米)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {monthlyData.map((month, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.sessions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.totalMeters}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.sessions > 0 ? Math.round(month.totalMeters / month.sessions) : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAllRecords = (records: SwimmingRecord[]) => {
    if (records.length === 0) {
      return <p className="text-gray-500 text-center py-8">暂无打卡记录</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                回合数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                距离 (米)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.rounds}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.meters}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!user) {
    return <LoadingSpinner text="正在验证身份..." />;
  }

  return (
    <Layout showNavigation>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">游泳记录报告</h1>

        {/* 报告类型选择 */}
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => handleReportTypeChange('weekly')}
              className={`px-4 py-2 rounded-md font-medium ${
                reportType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              周报告
            </button>
            <button
              onClick={() => handleReportTypeChange('monthly')}
              className={`px-4 py-2 rounded-md font-medium ${
                reportType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              月报告
            </button>
            <button
              onClick={() => handleReportTypeChange('all')}
              className={`px-4 py-2 rounded-md font-medium ${
                reportType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全部记录
            </button>
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
          >
            {loading ? '加载中...' : '查看报告'}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <ErrorMessage message={error} onRetry={fetchReport} />
        )}

        {/* 加载状态 */}
        {loading && <LoadingSpinner text="正在加载报告..." />}

        {/* 报告内容 */}
        {reportData && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderStatistics()}
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {reportType === 'weekly' && '周报告详情'}
                {reportType === 'monthly' && '月报告详情'}
                {reportType === 'all' && '全部记录详情'}
              </h2>
              
              {reportType === 'weekly' && renderWeeklyReport(reportData.weeklyReports || [])}
              {reportType === 'monthly' && renderMonthlyReport(reportData.monthlyReports || [])}
              {reportType === 'all' && renderAllRecords(reportData.records || [])}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}