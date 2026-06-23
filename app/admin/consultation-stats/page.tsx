'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, Zap, Target } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ConsultationStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  totalTokens: number;
  estimatedCostUSD: number;
  avgTokensPerRequest: number;
}

export default function ConsultationStatsPage() {
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/consultation/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không thể tải thống kê</p>
      </div>
    );
  }

  const costVND = stats.estimatedCostUSD * 25000; // Approximate VND conversion
  const effectiveCostPerRequest = stats.totalRequests > 0 
    ? stats.estimatedCostUSD / stats.totalRequests 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thống Kê Tư Vấn Phong Thủy</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi chi phí và hiệu suất của tính năng tư vấn AI
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Requests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cacheHits.toLocaleString()} từ cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.cacheMisses.toLocaleString()} cache misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tokens</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ~{stats.avgTokensPerRequest.toFixed(0)} tokens/request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi Phí</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.estimatedCostUSD.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              ~{costVND.toFixed(0)} VNĐ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi Phí Chi Tiết</CardTitle>
            <CardDescription>Phân tích chi phí OpenAI API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Chi phí mỗi request (có cache):</span>
              <span className="font-semibold">
                ${(effectiveCostPerRequest * 1000).toFixed(6)}/1K requests
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Chi phí mỗi cache miss:</span>
              <span className="font-semibold">
                ${stats.cacheMisses > 0 ? (stats.estimatedCostUSD / stats.cacheMisses).toFixed(6) : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tiết kiệm nhờ cache:</span>
              <span className="font-semibold text-green-600">
                ${stats.cacheMisses > 0 
                  ? ((stats.estimatedCostUSD / stats.cacheMisses) * stats.cacheHits).toFixed(4)
                  : '0'}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Tổng chi phí thực tế:</span>
                <span className="text-lg font-bold text-primary">
                  ${stats.estimatedCostUSD.toFixed(6)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Cache</CardTitle>
            <CardDescription>Phân tích hiệu quả caching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cache Hits</span>
                <span className="font-semibold text-green-600">
                  {stats.cacheHits.toLocaleString()} ({stats.cacheHitRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.cacheHitRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cache Misses</span>
                <span className="font-semibold text-orange-600">
                  {stats.cacheMisses.toLocaleString()} ({(100 - stats.cacheHitRate).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${100 - stats.cacheHitRate}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {stats.cacheHitRate >= 80 ? (
                  <span className="text-green-600">✅ Cache hoạt động tốt!</span>
                ) : stats.cacheHitRate >= 60 ? (
                  <span className="text-orange-600">⚠️ Cache có thể cải thiện</span>
                ) : (
                  <span className="text-red-600">❌ Cache cần tối ưu</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Dự Báo Chi Phí</CardTitle>
          <CardDescription>Ước tính chi phí theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Chi phí hôm nay</p>
              <p className="text-2xl font-bold">${stats.estimatedCostUSD.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">
                ~{costVND.toFixed(0)} VNĐ
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dự báo tháng này (30 ngày)</p>
              <p className="text-2xl font-bold">${(stats.estimatedCostUSD * 30).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                ~{(costVND * 30).toFixed(0)} VNĐ
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dự báo năm (365 ngày)</p>
              <p className="text-2xl font-bold">${(stats.estimatedCostUSD * 365).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                ~{(costVND * 365).toFixed(0)} VNĐ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1">ℹ️</div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900">Lưu ý về thống kê</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Thống kê được tính từ lúc server khởi động</li>
                <li>• Cache được lưu trong memory (sẽ mất khi restart)</li>
                <li>• Chi phí tính theo giá OpenAI gpt-4o-mini</li>
                <li>• Tỷ giá: 1 USD ≈ 25,000 VNĐ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
