"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  imageUrl?: string;
}

interface ChatbotProps {
  userName?: string;
  userEmail?: string;
  centered?: boolean;
}

const CHAT_HISTORY_KEY = "pest_assessment_chat_history";

export function AIChatbot({
  userName,
  userEmail,
  centered = false,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(centered);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const savedHistory = sessionStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        } catch (error) {
          console.error("Failed to parse chat history:", error);
        }
      }
    }

    return [
      {
        id: "1",
        content: userName
          ? `Hi ${userName}! I'm your AI pest assessment assistant. I'm here to help you identify your pest situation and connect you with the right solutions.\n\nWhat kind of pest are you dealing with? You can describe it to me, or if you'd like, you can upload a photo and I'll help identify it for you.`
          : "Hi! I'm your AI pest assessment assistant. I'm here to help you identify your pest situation and connect you with the right solutions.\n\nWhat kind of pest are you dealing with? You can describe it to me, or if you'd like, you can upload a photo and I'll help identify it for you.",
        sender: "bot",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (centered) {
      setIsOpen(true);
    }
  }, [centered]);

  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (content: string, imageUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      imageUrl,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedImage(data.url);
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      addBotMessage(
        "Sorry, I had trouble uploading that image. Please try again."
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveToGoogleSheets = async () => {
    console.log("[v0] Data saving is now handled by AI tool in the chat API");
  };

  const generateBotResponse = async (
    userMessage: string,
    imageUrl?: string
  ) => {
    try {
      setIsLoading(true);

      const conversationHistory = messages
        .filter((msg) => msg.id !== "1")
        .map((msg) => ({
          sender: msg.sender,
          content: msg.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory,
          userName: userName,
          imageUrl: imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I'm having trouble responding right now. Please try again or continue with your assessment.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if ((!textToSend && !uploadedImage) || isLoading) return;

    const imageToSend = uploadedImage;
    addUserMessage(
      textToSend || "Here's an image of the pest",
      imageToSend || undefined
    );
    setInputValue("");
    setUploadedImage(null);

    const response = await generateBotResponse(
      textToSend || "Can you identify this pest from the image?",
      imageToSend || undefined
    );
    addBotMessage(response);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (centered) {
    return (
      <Card className="w-full max-w-4xl shadow-2xl border-2 flex flex-col h-[calc(100vh-200px)] max-h-[800px]">
        <CardHeader className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  AI Pest Assessment
                  <Sparkles className="w-5 h-5 text-primary" />
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Conversational pest identification
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-muted/20 to-background min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-md ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border-2 border-border rounded-bl-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.sender === "bot" && (
                      <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {message.sender === "user" && (
                      <div className="bg-primary-foreground/20 p-2 rounded-full flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`text-base leading-relaxed ${
                        message.sender === "user" ? "" : "text-foreground"
                      }`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl || "/placeholder.svg"}
                          alt="Uploaded pest"
                          className="rounded-lg mb-3 max-w-full h-auto max-h-64 object-contain"
                        />
                      )}
                      {message.sender === "bot" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-3 space-y-1.5">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-3 space-y-1.5">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <span>{message.content}</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    } text-right`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border-2 border-border rounded-2xl rounded-bl-sm px-5 py-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-base text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-border p-6 bg-card/50 backdrop-blur-sm flex-shrink-0">
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Preview"
                  className="rounded-lg h-20 w-20 object-cover border-2"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => setUploadedImage(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading || isUploading}
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="rounded-full h-12 px-4"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </Button>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 text-base rounded-full border-2 focus-visible:ring-primary h-12 px-6"
                disabled={isLoading}
              />
              <Button
                size="lg"
                onClick={() => handleSendMessage()}
                disabled={(!inputValue.trim() && !uploadedImage) || isLoading}
                className="rounded-full w-12 h-12 p-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Press Enter to send • Upload images • Powered by AI
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <Badge className="absolute -top-2 -left-2 bg-accent text-accent-foreground">
          AI Assistant
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 shadow-2xl transition-all duration-300 border-2 flex flex-col h-[600px]">
        <CardHeader className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 font-semibold">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              Pest Assessment Assistant
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {message.sender === "bot" && (
                      <div className="bg-primary/10 p-1 rounded-full flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    {message.sender === "user" && (
                      <div className="bg-primary-foreground/20 p-1 rounded-full flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`text-sm leading-relaxed ${
                        message.sender === "user" ? "" : "text-foreground"
                      }`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl || "/placeholder.svg"}
                          alt="Uploaded pest"
                          className="rounded-lg mb-3 max-w-full h-auto max-h-64 object-contain"
                        />
                      )}
                      {message.sender === "bot" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <span>{message.content}</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      message.sender === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    } text-right`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-4 bg-background flex-shrink-0">
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Preview"
                  className="rounded-lg h-20 w-20 object-cover border-2"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => setUploadedImage(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading || isUploading}
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="rounded-full h-12 px-4"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </Button>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about pests..."
                className="flex-1 text-sm rounded-full border-2 focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="rounded-full w-9 h-9 p-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
