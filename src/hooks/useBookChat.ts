import { useState, useCallback } from 'react';
import { CoreMessage, streamText, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

export function useBookChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractPageText = useCallback(async (pageImageBase64: string | null): Promise<string | null> => {
    if (!pageImageBase64) return null;
    
    const apiKey = localStorage.getItem('bookeater_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    const provider = localStorage.getItem('bookeater_provider') || 'google';

    if (!apiKey) {
      alert('Please set your API key in Settings first.');
      return null;
    }

    setIsExtracting(true);
    try {
      let model;
      if (provider === 'google') {
        const google = createGoogleGenerativeAI({ apiKey });
        model = google('gemini-1.5-flash-latest');
      } else {
        const openai = createOpenAI({ apiKey });
        model = openai('gpt-4o');
      }

      const { text } = await generateText({
        model,
        system: "You are a precise text extractor. Extract all readable text from the provided image exactly as written. Do not add any conversational filler, markdown formatting, or extra commentary. Just the raw text.",
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Extract text from this page.' },
              { type: 'image', image: pageImageBase64 }
            ] 
          }
        ]
      });

      return text;
    } catch (error: any) {
      console.error('Extraction error:', error);
      alert('Failed to extract text from page: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const sendMessage = useCallback(async (text: string, pageImageBase64: string | null) => {
    const apiKey = localStorage.getItem('bookeater_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    const provider = localStorage.getItem('bookeater_provider') || 'google';

    if (!apiKey) {
      alert('Please set your API key in Settings first.');
      return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      let model;
      if (provider === 'google') {
        const google = createGoogleGenerativeAI({ apiKey });
        model = google('gemini-1.5-flash-latest');
      } else {
        const openai = createOpenAI({ apiKey });
        model = openai('gpt-4o');
      }

      // Format history for AI SDK CoreMessage
      const coreMessages: CoreMessage[] = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Add current message with image if available
      const currentContent: any[] = [{ type: 'text', text }];
      if (pageImageBase64) {
        currentContent.push({ type: 'image', image: pageImageBase64 });
      }
      coreMessages.push({ role: 'user', content: currentContent });

      const result = await streamText({
        model,
        messages: coreMessages,
        system: "You are BookEater, an AI Mentor. The user is reading a book or notes. They will provide an image of the current page (which may include handwritten notes or diagrams) and ask questions. Explain concepts clearly. If they ask to read the page or summarize, do so based on the provided image.",
      });

      let fullResponse = '';
      for await (const chunk of result.textStream) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMsgId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        );
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, content: `Error: ${error.message || 'Failed to connect. If using OpenAI, check CORS policies. Try Gemini for browser apps.'}`, isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return { messages, sendMessage, isLoading, extractPageText, isExtracting };
}