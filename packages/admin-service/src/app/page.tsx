'use client';

import { useState } from 'react';
import { env } from '@webbox/shared';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 调用 API 服务的登录接口
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 登录成功，保存 token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 重定向到仪表盘（暂时显示成功消息）
        alert('登录成功！\n\n用户: ' + data.user.username + '\n角色: ' + data.user.role);

        // TODO: 跳转到管理界面
        // window.location.href = '/dashboard';
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err: any) {
      setError('无法连接到服务器');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎨 Webbox Admin</h1>
          <p style={styles.subtitle}>管理后台登录</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            💡 提示：该登录功能将调用 API 服务
            <br />
            API 地址: <code>http://localhost:3002/api/auth/login</code>
          </p>
        </div>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>📋 演示说明</h3>
        <ul style={styles.infoList}>
          <li>Admin 服务运行在端口 3003</li>
          <li>登录功能调用 API 服务（端口 3002）的认证接口</li>
          <li>使用前需要先通过 API 创建用户账号</li>
          <li>成功登录后将在后续版本实现完整的管理功能</li>
        </ul>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    marginBottom: '24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  error: {
    background: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    padding: '12px',
    color: '#c33',
    fontSize: '14px',
    textAlign: 'center',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e1e8ed',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '8px',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e1e8ed',
  },
  footerText: {
    fontSize: '13px',
    color: '#666',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  infoCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '440px',
    width: '100%',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
  },
  infoList: {
    listStyle: 'none',
    fontSize: '14px',
    color: '#555',
    lineHeight: '2',
  },
};
