'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiClient from '@/lib/api-client';

export default function TestAdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔐 Attempting login with:', { username, password });
      
      const response = await apiClient.post('/admin/auth/login', {
        username,
        password,
      });

      console.log('✅ Login successful:', response);
      setResult(response);
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">🔐 Test Admin Login</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Login Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
            />
          </div>

          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <p className="font-semibold">Error</p>
            <pre className="text-xs mt-2 overflow-auto">{error}</pre>
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>✅ Login Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {result.user?.id}</p>
              <p><strong>Email:</strong> {result.user?.email}</p>
              <p><strong>Full Name:</strong> {result.user?.fullName}</p>
              <p><strong>Role:</strong> {result.user?.role}</p>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold">Raw Response</summary>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle>📝 Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Default Credentials:</strong></p>
          <p>Username: admin</p>
          <p>Password: 123456</p>
          <p className="mt-4"><strong>API Endpoint:</strong></p>
          <p>POST http://localhost:8080/api/admin/auth/login</p>
          <p className="mt-4"><strong>Check Console:</strong></p>
          <p>Open browser DevTools (F12) to see detailed logs</p>
        </CardContent>
      </Card>
    </div>
  );
}
