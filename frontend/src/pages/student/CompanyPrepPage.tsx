import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Building,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Zap,
  ArrowRight,
  Code2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

// Markdown & Table Renderer Component
const FormattedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  // Parse code blocks, tables, headers, lists
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];

  const flushTable = (key: string) => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={key} className="my-4 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-indigo-950/40 border-b border-slate-800 text-indigo-300 font-bold uppercase text-[11px]">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="p-3 border-r border-slate-800/60 last:border-0">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-slate-300 border-r border-slate-800/40 last:border-0 leading-normal">
                      {cell.trim().replace(/\*\*(.*?)\*\*/g, '$1')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    inTable = false;
    tableHeaders = [];
    tableRows = [];
  };

  const flushCode = (key: string) => {
    if (codeLines.length > 0) {
      const codeStr = codeLines.join('\n');
      elements.push(
        <div key={key} className="my-4 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-indigo-400">
              <Code2 className="w-3.5 h-3.5" /> {codeLanguage || 'code'}
            </span>
          </div>
          <pre className="p-4 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{codeStr}</code>
          </pre>
        </div>
      );
    }
    inCodeBlock = false;
    codeLanguage = '';
    codeLines = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCode(`code-${index}`);
      } else {
        if (inTable) flushTable(`table-${index}`);
        inCodeBlock = true;
        codeLanguage = trimmed.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Markdown Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeaders = trimmed.split('|').filter(Boolean);
      } else if (trimmed.includes('---')) {
        // Table separator line, skip
      } else {
        tableRows.push(trimmed.split('|').filter(Boolean));
      }
      return;
    } else if (inTable) {
      flushTable(`table-${index}`);
    }

    // Headers
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-base font-extrabold text-indigo-300 mt-5 mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
          {trimmed.replace('## ', '')}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-sm font-bold text-white mt-4 mb-1">
          {trimmed.replace('### ', '')}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={index} className="text-xs font-bold text-slate-300 mt-3 mb-1 uppercase tracking-wider">
          {trimmed.replace('#### ', '')}
        </h4>
      );
      return;
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
      const cleanList = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '');
      elements.push(
        <li key={index} className="ml-4 list-disc text-slate-300 text-xs my-1 leading-relaxed">
          {cleanList}
        </li>
      );
      return;
    }

    // Divider
    if (trimmed === '---') {
      elements.push(<hr key={index} className="my-4 border-slate-800" />);
      return;
    }

    // Paragraph
    if (trimmed.length > 0) {
      elements.push(
        <p key={index} className="text-xs text-slate-300 leading-relaxed my-2">
          {trimmed}
        </p>
      );
    }
  });

  if (inTable) flushTable('table-end');
  if (inCodeBlock) flushCode('code-end');

  return <div className="space-y-1">{elements}</div>;
};

export const CompanyPrepPage: React.FC = () => {
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const promptChips = [
    `Give me Microsoft tagged Dynamic Programming questions`,
    `Show me Amazon tagged Graph problems`,
    `List Google System Design interview questions`,
    `Give me LinkedIn tagged LeetCode problems`,
    `I have 7 days to prepare for ${targetCompany}. Create a plan`,
    `I am weak in Graphs. Which ${targetCompany} problems should I solve first?`,
  ];

  const companies = ['Amazon', 'Google', 'Microsoft', 'Atlassian', 'Walmart', 'Adobe', 'Zoho', 'Meta'];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputQuery('');
    setLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiRequest('/student/company-prep', {
        method: 'POST',
        body: JSON.stringify({
          query: textToSend.trim(),
          history: historyPayload,
          company: targetCompany,
        }),
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: res.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm('Reset current AI preparation chat thread?')) {
      setMessages([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-indigo-400" />
            Company AI <span className="gradient-text">Tech Prep Mentor</span>
          </h1>
          <p className="text-sm text-slate-400">
            Conversational AI mentor for company-tagged LeetCode roadmaps, System Design blueprints, sprint plans & code implementations.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleResetChat}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat Thread</span>
          </button>
        )}
      </div>

      {/* Target Company Selector Pills */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-2 border border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Target Panel:
        </span>
        {companies.map((comp) => (
          <button
            key={comp}
            onClick={() => setTargetCompany(comp)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              targetCompany === comp
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {comp}
          </button>
        ))}
      </div>

      {/* Main Chat Thread Container */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[660px] overflow-hidden">
        {/* Messages Feed Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            /* Welcome / Initial Prompt Chips State */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">
                  Ask Anything to Your AI Tech Mentor
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type any query for company-tagged LeetCode lists, code implementations in C++/Java/JS, 7-day sprint roadmaps, System Design architecture paths, or weak topic drills.
                </p>
              </div>

              {/* Sample Prompt Chips */}
              <div className="w-full space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Suggested Prompts for {targetCompany}:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                  {promptChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip)}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-between group transition-all"
                    >
                      <span className="truncate mr-2">{chip}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Thread Messages */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-6 rounded-3xl text-xs space-y-3 max-w-4xl border shadow-xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
                      : 'bg-slate-900/95 border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-[10px] uppercase tracking-wider opacity-80">
                      {msg.role === 'user' ? 'You' : `AI Tech Mentor (${targetCompany} Focus)`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Copy Markdown"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clean Markdown & Table Renderer */}
                  {msg.role === 'user' ? (
                    <p className="text-xs text-white leading-relaxed">{msg.content}</p>
                  ) : (
                    <FormattedMarkdown content={msg.content} />
                  )}

                  {/* Follow-up Chips for Assistant Messages */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Suggested Follow-Up Queries:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.suggestedFollowUps.map((fUp, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSendMessage(fUp)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                          >
                            {fUp} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 items-center text-indigo-400 font-semibold text-xs animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span>AI Tech Mentor is analyzing query & generating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              placeholder={`Ask your AI Tech Mentor (e.g. "Give me C++ solutions for top Medium problems" or "Amazon System Design")...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-5 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
