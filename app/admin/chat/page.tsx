'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { adminChatApi } from '@/lib/api/chat';

export default function AdminChatPage() {
  const [isReindexing, setIsReindexing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    documentsProcessed?: number;
    embeddingsCreated?: number;
  } | null>(null);

  const handleReindex = async (force: boolean) => {
    setIsReindexing(true);
    setResult(null);

    try {
      const response = await adminChatApi.reindex(force);
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi reindex',
      });
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Chatbot</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và cập nhật dữ liệu cho chatbot tư vấn sản phẩm
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reindex Dữ Liệu</CardTitle>
          <CardDescription>
            Cập nhật lại toàn bộ dữ liệu cho chatbot từ sản phẩm, FAQ, chính sách và hướng dẫn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => handleReindex(false)}
              disabled={isReindexing}
            >
              {isReindexing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reindex (Incremental)
                </>
              )}
            </Button>

            <Button
              onClick={() => handleReindex(true)}
              disabled={isReindexing}
              variant="destructive"
            >
              {isReindexing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reindex (Force - Xóa hết)
                </>
              )}
            </Button>
          </div>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <p className="font-semibold">{result.message}</p>
                {result.success && result.documentsProcessed !== undefined && (
                  <div className="mt-2 text-sm">
                    <p>Documents processed: {result.documentsProcessed}</p>
                    <p>Embeddings created: {result.embeddingsCreated}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Incremental:</strong> Chỉ cập nhật dữ liệu mới hoặc thay đổi</p>
            <p><strong>Force:</strong> Xóa toàn bộ và tạo lại từ đầu (khuyến nghị khi có thay đổi lớn)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Chatbot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Loại chatbot</p>
              <p className="font-semibold">RAG (Retrieval-Augmented Generation)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vector Database</p>
              <p className="font-semibold">PostgreSQL + pgvector</p>
            </div>
            <div>
              <p className="text-muted-foreground">Embedding Model</p>
              <p className="font-semibold">text-embedding-3-small</p>
            </div>
            <div>
              <p className="text-muted-foreground">LLM Model</p>
              <p className="font-semibold">GPT-4o-mini</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Nguồn dữ liệu:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Sản phẩm (Products table)</li>
              <li>FAQs (Câu hỏi thường gặp)</li>
              <li>Policies (Chính sách vận chuyển, đổi trả, bảo hành)</li>
              <li>Guides (Hướng dẫn chọn size, bảo quản)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
