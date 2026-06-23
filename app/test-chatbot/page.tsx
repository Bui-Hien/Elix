'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestChatbotIndexPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🤖 Chatbot Testing Suite</h1>
        <p className="text-muted-foreground">
          Test and verify the RAG chatbot implementation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reindex Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <CardTitle>1. Reindex Data</CardTitle>
            </div>
            <CardDescription>
              Index products, FAQs, policies, and guides into the chatbot knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test-reindex">
              <Button className="w-full">
                Go to Reindex
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              ⚠️ Run this first before testing the chat
            </p>
          </CardContent>
        </Card>

        {/* Test Chat Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle>2. Test Chat API</CardTitle>
            </div>
            <CardDescription>
              Test chatbot responses with various questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test-chat">
              <Button className="w-full">
                Go to Chat Test
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Test after reindexing is complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Setup Checklist */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>✅ Setup Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Backend Running</p>
              <p className="text-sm text-muted-foreground">
                API should be accessible at http://localhost:8080
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">PostgreSQL + pgvector</p>
              <p className="text-sm text-muted-foreground">
                Docker container running on port 5433
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">OpenAI API Key</p>
              <p className="text-sm text-muted-foreground">
                Must be configured in appsettings.json
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">Data Indexed</p>
              <p className="text-sm text-muted-foreground">
                Run reindex before testing chat
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle>🔗 Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Backend Swagger UI</span>
            <a
              href="http://localhost:8080/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Open →
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Admin Panel</span>
            <Link href="/admin/chat" className="text-sm text-blue-600 hover:underline">
              Open →
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Shop Page (with chat widget)</span>
            <Link href="/products" className="text-sm text-blue-600 hover:underline">
              Open →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📚 Documentation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Complete Guide:</strong> See <code>RAG_CHATBOT_GUIDE.md</code>
          </p>
          <p>
            <strong>Quick Start:</strong> See <code>CHATBOT_QUICKSTART.md</code>
          </p>
          <p>
            <strong>Testing Guide:</strong> See <code>CHATBOT_TESTING_GUIDE.md</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
