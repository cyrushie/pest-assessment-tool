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
} from "lucide-react";

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
}

const getContextualPrompts = (currentQuestion: number, answers: any) => {
  const prompts = [
    [
      "I see you're checking for pest signs! Let me know if you'd like advice on how to handle what you're seeing.",
      "Need help identifying what you might be dealing with? I'm here to guide you through the process.",
    ],
    [
      "Different areas of your home can indicate different types of pests. Feel free to ask about specific locations!",
      "Kitchen and bathroom areas are common hotspots for certain pests. Let me know if you need clarification.",
    ],
    [
      "Pest behavior patterns can tell us a lot about what you're dealing with. Ask me about any unusual activity you've noticed.",
      "Nocturnal activity is very common with many pests. I can help explain what different behaviors might indicate.",
    ],
    [
      "These signs are key indicators for pest identification. Don't hesitate to ask if you're unsure about what you're seeing.",
      "Physical evidence like droppings and damage patterns help us narrow down the pest type significantly.",
    ],
    [
      "Frequency is crucial for determining the severity of your pest issue. This helps us recommend the right level of response.",
      "It sounds like you're experiencing some pest activity. Would you like me to guide you toward scheduling a consultation?",
    ],
  ];

  return (
    prompts[currentQuestion] || [
      "I'm here to help with any questions about your pest assessment!",
      "Feel free to ask me anything about pest identification or treatment options.",
    ]
  );
};

export function AIChatbot({
  currentQuestion,
  answers,
  onSuggestAction,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your pest assessment assistant. I'm here to help you through this process and answer any questions you might have.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add contextual prompts when question changes
  useEffect(() => {
    if (currentQuestion > 0) {
      const prompts = getContextualPrompts(currentQuestion, answers);
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      setTimeout(() => {
        addBotMessage(randomPrompt);
      }, 1000);
    }
  }, [currentQuestion]);

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

  const generateBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    // Simple response logic based on keywords
    if (
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("consultation") ||
      lowerMessage.includes("call")
    ) {
      return "Great! I'd be happy to help you schedule a consultation. Once you complete the assessment, you'll see an option to schedule a call. Would you like me to guide you through the remaining questions?";
    }

    if (lowerMessage.includes("cockroach") || lowerMessage.includes("roach")) {
      return "Cockroaches often leave musty odors and are commonly found in kitchens and bathrooms. They're nocturnal, so you might see them scurrying at night. If you're seeing signs in these areas, it could indicate a cockroach issue.";
    }

    if (
      lowerMessage.includes("mouse") ||
      lowerMessage.includes("rat") ||
      lowerMessage.includes("rodent")
    ) {
      return "Rodents typically leave small, dark droppings and gnaw marks on food packaging or furniture. You might hear scurrying sounds, especially at night. They often nest in attics, basements, or storage areas.";
    }

    if (
      lowerMessage.includes("bed bug") ||
      lowerMessage.includes("bite") ||
      lowerMessage.includes("bedroom")
    ) {
      return "Bed bugs are often found in bedrooms and leave bite marks on skin. Look for small blood stains on sheets or dark spots on mattresses. They're most active at night when you're sleeping.";
    }

    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what") ||
      lowerMessage.includes("how")
    ) {
      return "I'm here to help! You can ask me about specific pest types, what certain signs might indicate, or how to interpret the questions. What would you like to know more about?";
    }

    if (lowerMessage.includes("frequency") || lowerMessage.includes("often")) {
      return "Frequency helps us determine the severity of your pest issue. Daily sightings usually indicate a significant problem requiring immediate attention, while occasional sightings might be manageable with preventive measures.";
    }

    return "That's a great question! Based on your assessment so far, I can help you understand what different signs and behaviors might indicate. Feel free to ask about specific pest types or what you should look for.";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    const response = generateBotResponse(inputValue);

    setTimeout(() => {
      addBotMessage(response);
    }, 500);

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
        className={`w-80 shadow-xl transition-all duration-300 ${
          isMinimized ? "h-16" : "h-96"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Pest Assessment Assistant
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === "bot" && (
                        <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      )}
                      {message.sender === "user" && (
                        <User className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{message.content}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about pests..."
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
