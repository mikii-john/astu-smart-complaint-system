import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Hi! I'm the ASTU Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Construct the full conversation history for the model
      const contents = [
        ...messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
        { role: "user", parts: [{ text: userMessage }] }
      ];

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        config: {
          systemInstruction: "You are a helpful assistant for ASTU (Adama Science and Technology University) students. You help them navigate the complaint system, answer general campus questions, and provide support. Be concise, friendly, and professional. If a student has a specific complaint (like broken equipment), guide them to use the 'New Complaint' form in the dashboard.",
        },
        contents: contents,
      });

      const response = result.text;

      if (response) {
        setMessages((prev) => [...prev, { role: "model", text: response }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-80 md:w-96 shadow-2xl"
          >
            <Card className="border-blue-100 overflow-hidden h-[500px] flex flex-col">
              <CardHeader className="bg-blue-600 text-white p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  ASTU Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-blue-700 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 rounded-bl-none shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
};

export default Chatbot;
