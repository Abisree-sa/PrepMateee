import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  PlusSquare,
  Trash2,
  Plus,
  Sparkles,
  Building2,
  Code2,
  CheckCircle,
  FileCode,
  Zap,
  Sliders,
} from 'lucide-react';

interface TestCaseDraft {
  input: string;
  output: string;
  isHidden: boolean;
}

interface CodingQuestionDraft {
  id: string;
  type: 'CODING' | 'MCQ' | 'FILL_IN_BLANK';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  questionText: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  starterTemplates: {
    java: string;
    python: string;
    cpp: string;
    c: string;
    javascript: string;
  };
  testCases: TestCaseDraft[];
  marks: number;
}

export const AssessmentBuilderPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [randomize, setRandomize] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState('0.0');
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<CodingQuestionDraft[]>([
    {
      id: 'q_default_1',
      type: 'CODING',
      title: 'Two Sum & Hash Pair Search',
      difficulty: 'Easy',
      topic: 'Arrays & Sliding Window',
      questionText: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      inputFormat: 'Line 1: N (array size)\nLine 2: N space-separated integers\nLine 3: target integer',
      outputFormat: 'Two space-separated indices representing 0-indexed positions.',
      sampleInput: '4\n2 7 11 15\n9',
      sampleOutput: '0 1',
      explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterTemplates: {
        java: `import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write solution here\n        return new int[]{};\n    }\n}`,
        python: `def twoSum(nums, target):\n    # Write solution here\n    pass`,
        cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write solution here\n        return {};\n    }\n};`,
        c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    return res;\n}`,
        javascript: `function twoSum(nums, target) {\n  // Write solution here\n  return [];\n}`
      },
      testCases: [
        { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
        { input: '3\n3 2 4\n6', output: '1 2', isHidden: false },
        { input: '2\n3 3\n6', output: '0 1', isHidden: true },
        { input: '5\n1 5 3 7 9\n12', output: '1 3', isHidden: true }
      ],
      marks: 20,
    },
  ]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await apiRequest('/coordinator/departments');
        setDepartments(res.departments || []);
        if (res.departments && res.departments.length > 0) {
          setSelectedDeptIds([res.departments[0].id]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDepts();
  }, []);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() || aiGenerating) return;
    setAiGenerating(true);

    try {
      const res = await apiRequest('/assessments/generate-coding-ai', {
        method: 'POST',
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (res.question) {
        const q = res.question;
        const newQ: CodingQuestionDraft = {
          id: `q_${Date.now()}`,
          type: 'CODING',
          title: q.title || 'AI Generated Problem',
          difficulty: q.difficulty || 'Medium',
          topic: q.topic || 'Arrays',
          questionText: q.questionText || '',
          constraints: q.constraints || '1 <= N <= 10^5',
          inputFormat: q.inputFormat || '',
          outputFormat: q.outputFormat || '',
          sampleInput: q.sampleInput || '',
          sampleOutput: q.sampleOutput || '',
          explanation: q.explanation || '',
          timeLimitMs: q.timeLimitMs || 2000,
          memoryLimitMb: q.memoryLimitMb || 256,
          starterTemplates: q.starterTemplates || {
            java: 'public class Solution { public static void main(String[] args) {} }',
            python: 'def solve(): pass',
            cpp: 'int main() { return 0; }',
            c: 'int main() { return 0; }',
            javascript: 'function solve() {}'
          },
          testCases: q.testCases || [{ input: '', output: '', isHidden: false }],
          marks: 20,
        };
        setQuestions([...questions, newQ]);
        setAiPrompt('');
        alert(`Successfully generated "${q.title}" LeetCode question template!`);
      }
    } catch (err: any) {
      alert(err.message || 'AI Generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImportPreset = async (presetKey: string) => {
    try {
      const res = await apiRequest('/assessments/coding-preset', {
        method: 'POST',
        body: JSON.stringify({ presetKey }),
      });

      if (res.question) {
        const q = res.question;
        const newQ: CodingQuestionDraft = {
          id: `q_${Date.now()}`,
          type: 'CODING',
          title: q.title,
          difficulty: q.difficulty,
          topic: q.topic,
          questionText: q.questionText,
          constraints: q.constraints,
          inputFormat: q.inputFormat,
          outputFormat: q.outputFormat,
          sampleInput: q.sampleInput,
          sampleOutput: q.sampleOutput,
          explanation: q.explanation,
          timeLimitMs: q.timeLimitMs,
          memoryLimitMb: q.memoryLimitMb,
          starterTemplates: q.starterTemplates,
          testCases: q.testCases,
          marks: 25,
        };
        setQuestions([...questions, newQ]);
      }
    } catch (err: any) {
      alert(err.message || 'Preset import failed');
    }
  };

  const handleAddBlankQuestion = () => {
    const newQ: CodingQuestionDraft = {
      id: `q_${Date.now()}`,
      type: 'CODING',
      title: 'Custom Coding Problem',
      difficulty: 'Medium',
      topic: 'Algorithms',
      questionText: 'Write a program to solve...',
      constraints: '1 <= N <= 10^5',
      inputFormat: 'Standard Input',
      outputFormat: 'Standard Output',
      sampleInput: '5\n1 2 3 4 5',
      sampleOutput: '15',
      explanation: 'Sum of elements is 15.',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterTemplates: {
        java: 'public class Solution {\n  public static void main(String[] args) {}\n}',
        python: 'def solve():\n    pass',
        cpp: '#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}',
        c: '#include <stdio.h>\nint main() {\n  return 0;\n}',
        javascript: 'function solve(input) {\n  return 0;\n}'
      },
      testCases: [
        { input: '5\n1 2 3 4 5', output: '15', isHidden: false },
        { input: '3\n10 20 30', output: '60', isHidden: true }
      ],
      marks: 20,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: string, field: keyof CodingQuestionDraft, val: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: val } : q)));
  };

  const toggleDept = (id: string) => {
    if (selectedDeptIds.includes(id)) {
      setSelectedDeptIds(selectedDeptIds.filter((d) => d !== id));
    } else {
      setSelectedDeptIds([...selectedDeptIds, id]);
    }
  };

  const handlePublishAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('Assessment Title is required');
    if (selectedDeptIds.length === 0) return alert('Select at least one department');

    const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

    setLoading(true);
    try {
      await apiRequest('/coordinator/assessments', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          totalMarks,
          durationMinutes,
          randomize,
          negativeMarking: parseFloat(negativeMarking),
          departmentIds: selectedDeptIds,
          questions: questions.map((q) => ({
            type: q.type,
            title: q.title,
            difficulty: q.difficulty,
            topic: q.topic,
            questionText: q.questionText,
            constraints: q.constraints,
            inputFormat: q.inputFormat,
            outputFormat: q.outputFormat,
            sampleInput: q.sampleInput,
            sampleOutput: q.sampleOutput,
            starterTemplates: q.starterTemplates,
            testCases: q.testCases,
            timeLimitMs: q.timeLimitMs,
            memoryLimitMb: q.memoryLimitMb,
            explanation: q.explanation,
            marks: q.marks,
          })),
        }),
      });

      alert('Enterprise LeetCode-Style Assessment Published Successfully!');
      navigate('/coordinator/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Code2 className="w-7 h-7 text-purple-400" />
          Enterprise Coding Assessment <span className="gradient-text">Question Builder</span>
        </h1>
        <p className="text-sm text-slate-400">
          Design LeetCode, HackerRank & GFG-style coding challenges with AI Question Generator, famous presets & multi-language testcase suites.
        </p>
      </div>

      {/* AI Coding Question Generator Toolbar */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Coding Question Generator</h3>
          </div>
          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            Powered by Gemini AI
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 'Generate an Easy Array problem for Amazon' or 'Generate a Hard DP question for Google'..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateAI(); }}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={aiGenerating || !aiPrompt.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{aiGenerating ? 'Generating Question...' : 'Generate AI Problem'}</span>
          </button>
        </div>

        {/* Famous Platform Preset Imports */}
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Famous Presets:
          </span>
          {['Two Sum (LeetCode #1)', 'Number of Islands (GFG)', 'Coin Change (HackerRank)'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleImportPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/50 transition-all font-semibold"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handlePublishAssessment} className="space-y-8">
        {/* Assessment Scope & Duration */}
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 space-y-6">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Assessment Scope & Department Allocation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SDE Coding Assessment - Department Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Departments *
            </label>
            <div className="flex flex-wrap gap-2">
              {departments.map((d) => {
                const isChecked = selectedDeptIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDept(d.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isChecked
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{d.name} ({d.code})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coding Question Cards List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              Coding Challenges ({questions.length})
            </h2>

            <button
              type="button"
              onClick={handleAddBlankQuestion}
              className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Problem</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={q.id} className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 relative">
              <button
                type="button"
                onClick={() => handleRemoveQuestion(q.id)}
                className="absolute top-6 right-6 p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-extrabold text-purple-400">Problem {qIdx + 1}</span>

                <div>
                  <select
                    value={q.difficulty}
                    onChange={(e) => handleUpdateQuestion(q.id, 'difficulty', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Topic (e.g. Arrays, Graphs, DP)"
                    value={q.topic}
                    onChange={(e) => handleUpdateQuestion(q.id, 'topic', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Marks:</span>
                  <input
                    type="number"
                    min={5}
                    value={q.marks}
                    onChange={(e) => handleUpdateQuestion(q.id, 'marks', parseInt(e.target.value, 10))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Problem Title
                </label>
                <input
                  type="text"
                  placeholder="Problem Title"
                  value={q.title}
                  onChange={(e) => handleUpdateQuestion(q.id, 'title', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Problem Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Full LeetCode-style problem statement..."
                  value={q.questionText}
                  onChange={(e) => handleUpdateQuestion(q.id, 'questionText', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Constraints
                  </label>
                  <textarea
                    rows={2}
                    placeholder="1 <= N <= 10^5"
                    value={q.constraints}
                    onChange={(e) => handleUpdateQuestion(q.id, 'constraints', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Explanation
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Sample walkthrough explanation..."
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(q.id, 'explanation', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-300"
                  />
                </div>
              </div>

              {/* Sample Test Case Suite */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Evaluation Test Cases ({q.testCases.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...q.testCases, { input: '', output: '', isHidden: true }];
                      handleUpdateQuestion(q.id, 'testCases', updated);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:underline"
                  >
                    + Add Test Case
                  </button>
                </div>

                <div className="space-y-3">
                  {q.testCases.map((tc, tcIdx) => (
                    <div key={tcIdx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center">
                      <span className="text-[10px] font-bold text-slate-400 w-16">
                        {tc.isHidden ? '🔒 Hidden' : '👁️ Sample'} #{tcIdx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Input data"
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...q.testCases];
                          updated[tcIdx].input = e.target.value;
                          handleUpdateQuestion(q.id, 'testCases', updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output"
                        value={tc.output}
                        onChange={(e) => {
                          const updated = [...q.testCases];
                          updated[tcIdx].output = e.target.value;
                          handleUpdateQuestion(q.id, 'testCases', updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = q.testCases.filter((_, i) => i !== tcIdx);
                          handleUpdateQuestion(q.id, 'testCases', updated);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Publishing LeetCode Assessment...' : 'Publish Enterprise Coding Assessment'}
        </button>
      </form>
    </div>
  );
};
