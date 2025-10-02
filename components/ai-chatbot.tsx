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
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotProps {
  currentQuestion: number;
  answers: { [key: number]: string | string[] };
  onSuggestAction?: (action: string) => void;
  userName?: string;
  assessmentResults?: {
    primaryPest: string;
    severity: string;
    selectedPests: string[];
  };
}

const CHAT_HISTORY_KEY = "pest_assessment_chat_history";
const RESULTS_MESSAGE_SENT_KEY = "pest_assessment_results_message_sent";

export function AIChatbot({
  currentQuestion,
  answers,
  onSuggestAction,
  userName,
  assessmentResults,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const resultsMessageSentRef = useRef(false);

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
          ? `Hi ${userName}! I'm your pest assessment assistant powered by AI. I'm here to help you through this process and answer any questions you might have about pests and the assessment.`
          : "Hi! I'm your pest assessment assistant powered by AI. I'm here to help you through this process and answer any questions you might have about pests and the assessment.",
        sender: "bot",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      assessmentResults &&
      typeof window !== "undefined" &&
      !resultsMessageSentRef.current
    ) {
      const messageAlreadySent = sessionStorage.getItem(
        RESULTS_MESSAGE_SENT_KEY
      );

      if (!messageAlreadySent) {
        // Mark as sent immediately to prevent race conditions
        resultsMessageSentRef.current = true;

        const generateResultsMessage = async () => {
          setIsLoading(true);
          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: "generate_initial_results_message",
                userName: userName,
                assessmentResults: assessmentResults,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              const newMessage: Message = {
                id: Date.now().toString(),
                content: data.response,
                sender: "bot",
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, newMessage]);
              sessionStorage.setItem(RESULTS_MESSAGE_SENT_KEY, "true");
              setIsOpen((prev) => prev || true);
            }
          } catch (error) {
            console.error("Error generating results message:", error);
            // Reset ref on error so it can be retried
            resultsMessageSentRef.current = false;
          } finally {
            setIsLoading(false);
          }
        };

        generateResultsMessage();
      } else {
        // Message was already sent in a previous session
        resultsMessageSentRef.current = true;
      }
    }
  }, [assessmentResults, userName]);

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

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const generateBotResponse = async (userMessage: string) => {
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
          assessmentResults: assessmentResults,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I'm having trouble responding right now. Please try again or continue with your assessment. If you need immediate help, feel free to schedule a consultation!";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    addUserMessage(inputValue);
    const userMsg = inputValue;
    setInputValue("");

    const response = await generateBotResponse(userMsg);
    addBotMessage(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

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
      <Card
        className={`w-96 shadow-2xl overflow-hidden  transition-all duration-300 border-2 flex flex-col ${
          isMinimized ? "h-24" : "h-[600px]"
        }`}
      >
        <CardHeader className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex-shrink-0">
          <div className="flex  items-center justify-between">
            <CardTitle className="text-base  flex items-center gap-2 font-semibold">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Bot className="w-4 h-4 text-primary" />
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
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7 p-0 hover:bg-primary/10"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </Button>
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

        {!isMinimized && (
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
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about pests..."
                  className="flex-1 text-sm rounded-full border-2 focus-visible:ring-primary"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
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
        )}
      </Card>
    </div>
  );
}
