'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { adminChatApi } from '@/lib/api/chat';

export default function TestReindexPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReindex = async (force: boolean) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await adminChatApi.reindex(force);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reindex');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🔄 Test Chatbot Reindex</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reindex Chatbot Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will index all products, FAQs, policies, and guides into the chatbot knowledge base.
          </p>

          <div className="flex gap-3">
            <Button onClick={() => handleReindex(false)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reindex (Incremental)
                </>
              )}
            </Button>

            <Button onClick={() => handleReindex(true)} disabled={loading} variant="destructive">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reindex (Force - Clear All)
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Incremental:</strong> Only updates new or changed data
            </p>
            <p>
              <strong>Force:</strong> Clears everything and rebuilds from scratch (recommended for first time)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Error</p>
            <pre className="text-xs mt-2 overflow-auto">{error}</pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {result && result.success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">{result.message}</p>
            <div className="mt-2 text-sm space-y-1">
              <p>Documents Processed: <strong>{result.documentsProcessed}</strong></p>
              <p>Embeddings Created: <strong>{result.embeddingsCreated}</strong></p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Raw Response */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Response Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle>📝 Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-semibold">⚠️ Important:</p>
          <p>1. Make sure you're logged in as admin</p>
          <p>2. Backend must be running at http://localhost:8080</p>
          <p>3. OpenAI API key must be configured</p>
          <p>4. This process takes ~30-60 seconds</p>
          <p className="font-semibold mt-4">First Time Setup:</p>
          <p>1. Click "Reindex (Force - Clear All)"</p>
          <p>2. Wait for completion</p>
          <p>3. Go to /test-chat to test the chatbot</p>
        </CardContent>
      </Card>
    </div>
  );
}
