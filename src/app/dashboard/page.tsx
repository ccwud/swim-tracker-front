'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rounds, setRounds] = useState<number>(0);
  const [roundMeters, setRoundMeters] = useState<number>(27);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchConfig();
  }, [user, authLoading, router]);

  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      // 根据API文档，后端没有配置接口，使用默认值
      setRoundMeters(27);
    } catch (error) {
      console.error('获取配置失败:', error);
      // 使用默认值
      setRoundMeters(27);
    } finally {
      setConfigLoading(false);
    }
  };

  const handlePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rounds <= 0) {
      setMessage({ type: 'error', text: '请输入有效的回合数' });
      return;
    }

    if (roundMeters <= 0) {
      setMessage({ type: 'error', text: '请输入有效的回合长度' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 根据API文档，使用新的打卡接口
      const response = await api.punchIn({
        rounds,
        roundLengthMeters: roundMeters
      });
      
      // 根据API文档，成功响应包含记录详情
      if (response.data.id) {
        const { distanceMeters } = response.data;
        setMessage({ type: 'success', text: `打卡成功！游泳 ${rounds} 回合，共 ${distanceMeters} 米` });
        setRounds(0);
      } else {
        setMessage({ type: 'error', text: '打卡失败' });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: string } }).response?.data || '打卡失败，请重试'
        : '打卡失败，请重试';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner text="正在验证身份..." />;
  }

  if (configLoading) {
    return (
      <Layout showNavigation>
        <LoadingSpinner text="正在加载配置..." />
      </Layout>
    );
  }

  return (
    <Layout showNavigation>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">游泳打卡</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePunch} className="space-y-4">
          <div>
            <label htmlFor="rounds" className="block text-sm font-medium text-gray-700 mb-2">
              输入您完成的回合数
            </label>
            <Input
              type="number"
              id="rounds"
              min="1"
              value={rounds || ''}
              onChange={(e) => setRounds(parseInt(e.target.value) || 0)}
              fullWidth
              placeholder="请输入回合数"
              required
            />
          </div>

          <div>
            <label htmlFor="roundMeters" className="block text-sm font-medium text-gray-700 mb-2">
              一个回合长度（米）
            </label>
            <Input
              type="number"
              id="roundMeters"
              min="1"
              value={roundMeters || ''}
              onChange={(e) => setRoundMeters(parseInt(e.target.value) || 27)}
              fullWidth
              placeholder="请输入回合长度"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预计游泳距离
            </label>
            <Input
              type="text"
              value={`${rounds * roundMeters} 米`}
              readOnly
              fullWidth
            />
          </div>

          <Button
            type="submit"
            disabled={loading || rounds <= 0 || roundMeters <= 0}
            fullWidth
            variant="primary"
          >
            {loading ? '打卡中...' : '打卡'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}