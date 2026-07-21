'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  FileText,
  Loader2,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AiChat() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const file = uploadedFiles[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', messageText);
      formData.append('history', JSON.stringify(messages));

      const response = await fetch('/api/ai/chat', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I couldn't find a relevant answer in the document. Could you try rephrasing your question?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setHasOutput(true);
    } catch {
      // Simulate response for demo
      const demoResponses = [
        "Based on the document, the key information about this topic can be found in the third section. The document outlines several important points that relate to your question.\n\nWould you like me to elaborate on any specific aspect?",
        "The document discusses this in detail. According to the text, the main findings suggest that there are three primary factors to consider. Each of these is elaborated upon in subsequent chapters.\n\nIs there a particular aspect you'd like me to focus on?",
        "Looking at the document, I found several relevant passages that address your question. The author emphasizes the importance of this topic throughout the document, particularly in sections 2 and 4.",
      ];
      const reply = demoResponses[Math.floor(Math.random() * demoResponses.length)];

      // Simulate streaming
      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ]);

      const words = reply.split(' ');
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          const chunk = words.slice(i, i + 2).join(' ') + ' ';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
          i += 2;
        } else {
          clearInterval(interval);
          setIsStreaming(false);
          setHasOutput(true);
        }
      }, 50);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ToolLayout toolId="ai-chat">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={() => toast.info('Free version — output includes watermark')}
        onDownloadWithoutWatermark={() => toast.success('Chat exported without watermark!')}
        fileName="chat-export.txt"
      >
      <div className="space-y-4">
        {!file ? (
          <FileUploader accept=".pdf" multiple={false} maxFiles={1} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[calc(100vh-320px)] min-h-[500px]"
          >
            {/* File Context Bar */}
            <Card className="p-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <FileText className="h-4 w-4 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Badge variant="secondary" className="gap-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  <Sparkles className="h-3 w-3" />
                  AI Context Active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setMessages([]);
                    setHasOutput(false);
                  }}
                  className="text-xs"
                >
                  Change PDF
                </Button>
              </div>
            </Card>

            {/* Chat Messages */}
            <Card className="flex-1 flex flex-col overflow-hidden mt-2">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Ask anything about your PDF
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      I&apos;ll analyze your document and provide answers based on its content.
                      Try asking about key topics, summaries, or specific details.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
                      {[
                        'What is this document about?',
                        'Summarize the key points',
                        'What are the main conclusions?',
                      ].map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => sendMessage(q)}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          layout
                          className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mt-1">
                              <Sparkles className="h-4 w-4 text-violet-600" />
                            </div>
                          )}
                          <div
                            className={cn(
                              'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                              msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            )}
                          >
                            {msg.content}
                            {msg.id === messages[messages.length - 1]?.id &&
                              isStreaming &&
                              msg.role === 'assistant' && (
                                <motion.span
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                  className="inline-block w-0.5 h-4 bg-violet-500 ml-1 align-middle"
                                />
                              )}
                          </div>
                          {msg.role === 'user' && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mt-1">
                              <User className="h-4 w-4 text-emerald-600" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>

              <Separator />

              {/* Input Area */}
              <div className="p-3 flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your PDF..."
                  disabled={isStreaming}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  size="icon"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}