'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chatApi } from '@/lib/api/chat';
import { Loader2 } from 'lucide-react';

export default function TestChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await chatApi.createSession();
      setSessionId(session.sessionId);
      alert('Session created: ' + session.sessionId);
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || !message.trim()) {
      alert('Please create session and enter message');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await chatApi.sendMessage({
        sessionId,
        message: message.trim(),
      });
      setResponse(result);
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🤖 Test Chatbot API</h1>

      {/* Step 1: Create Session */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Create Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={createSession} disabled={loading || !!sessionId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : sessionId ? (
              '✅ Session Created'
            ) : (
              'Create Session'
            )}
          </Button>
          {sessionId && (
            <p className="mt-2 text-sm text-muted-foreground">
              Session ID: <code className="bg-muted px-2 py-1 rounded">{sessionId}</code>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Send Message */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 2: Send Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập câu hỏi..."
              disabled={!sessionId || loading}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={!sessionId || loading || !message.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </div>

          {/* Quick Test Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Quick Tests:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMessage('Vòng tay thạch anh hồng giá bao nhiêu?')}
                disabled={!sessionId || loading}
              >
                Test 1: Product Price
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMessage('Giao hàng mất bao lâu?')}
                disabled={!sessionId || loading}
              >
                Test 2: Shipping
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMessage('Làm sao để chọn size vòng tay?')}
                disabled={!sessionId || loading}
              >
                Test 3: Size Guide
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMessage('Có ship quốc tế không?')}
                disabled={!sessionId || loading}
              >
                Test 4: Unknown Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">❌ Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">{error}</pre>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>✅ Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer */}
            <div>
              <p className="text-sm font-semibold mb-2">Answer:</p>
              <div className="bg-muted p-4 rounded">
                <p className="whitespace-pre-wrap">{response.answer}</p>
              </div>
            </div>

            {/* Suggested Products */}
            {response.suggestedProducts && response.suggestedProducts.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Suggested Products:</p>
                <div className="space-y-2">
                  {response.suggestedProducts.map((product: any) => (
                    <div key={product.id} className="bg-muted p-3 rounded flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {response.sources && response.sources.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Sources (Document IDs):</p>
                <div className="flex flex-wrap gap-2">
                  {response.sources.map((source: string) => (
                    <code key={source} className="bg-muted px-2 py-1 rounded text-xs">
                      {source}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details>
              <summary className="text-sm font-semibold cursor-pointer">Raw JSON Response</summary>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto mt-2">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle>📝 Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Click "Create Session" to start</p>
          <p>2. Use quick test buttons or type your own question</p>
          <p>3. Click "Send" to get response</p>
          <p className="font-semibold mt-4">⚠️ Important:</p>
          <p>- Make sure backend is running at http://localhost:8080</p>
          <p>- Make sure you've run reindex from admin panel first</p>
          <p>- OpenAI API key must be configured in appsettings.json</p>
        </CardContent>
      </Card>
    </div>
  );
}
