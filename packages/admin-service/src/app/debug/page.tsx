'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getToken, getUserInfo } from '@/api/auth';

export default function DebugPage() {
  const auth = useAuth();
  const token = typeof window !== 'undefined' ? getToken() : null;
  const userInfo = typeof window !== 'undefined' ? getUserInfo() : null;

  return (
    <div style={{ padding: '50px', fontFamily: 'monospace', fontSize: '14px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>AuthContext 调试信息</h1>

      <div style={{ backgroundColor: '#f0f0f0', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>AuthContext 状态</h2>
        <p>loading: <strong>{String(auth.loading)}</strong></p>
        <p>isAuthenticated: <strong>{String(auth.isAuthenticated)}</strong></p>
        <p>user: <strong>{auth.user ? JSON.stringify(auth.user) : 'null'}</strong></p>
      </div>

      <div style={{ backgroundColor: '#e0e0e0', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>存储状态</h2>
        <p>token: <strong>{token || '无'}</strong></p>
        <p>userInfo: <strong>{userInfo ? JSON.stringify(userInfo) : '无'}</strong></p>
      </div>

      <div style={{ backgroundColor: '#d0d0d0', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>环境信息</h2>
        <p>window: <strong>{typeof window !== 'undefined' ? '存在' : '不存在'}</strong></p>
        <p>document: <strong>{typeof document !== 'undefined' ? '存在' : '不存在'}</strong></p>
        <p>localStorage: <strong>{typeof localStorage !== 'undefined' ? '存在' : '不存在'}</strong></p>
      </div>
    </div>
  );
}
