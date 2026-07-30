import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiRequest } from '../../services/api';
import { ExamProctorOverlay } from '../../components/student/ExamProctorOverlay';
import {
  CheckSquare,
  Clock,
  Code2,
  FileQuestion,
  Play,
  ArrowRight,
  ShieldCheck,
  Camera,
  Mic,
  Maximize,
  Terminal,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
} from 'lucide-react';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c'] as const;
type Lang = typeof LANGUAGES[number];

const DEFAULT_STARTER_TEMPLATES: Record<Lang, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    
}`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
  java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
  c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    // Write your solution here
    return res;
}`,
};

const LeetCodeIDE: React.FC<{
  question: any;
  value: string;
  onChange: (val: string) => void;
  onSubmitQuestion: (code: string, language: string) => void;
  isQuestionSubmitted?: boolean;
}> = ({ question, value, onChange, onSubmitQuestion, isQuestionSubmitted }) => {
  const [lang, setLang] = useState<Lang>('javascript');
  const [activeTab, setActiveTab] = useState<'problem' | 'testcase' | 'result'>('problem');
  const [executing, setExecuting] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState(question.sampleInput || '');

  const templates = question.starterTemplates || DEFAULT_STARTER_TEMPLATES;
  const currentCode = value || templates[lang] || DEFAULT_STARTER_TEMPLATES[lang];

  const validateCodeInput = (codeStr: string): boolean => {
    setValidationError(null);
    if (!codeStr || !codeStr.trim()) {
      setValidationError('Please write your solution before running or submitting.');
      return false;
    }
    const lines = codeStr.trim().split('\n').filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('#') && !l.trim().startsWith('/*') && !l.trim().startsWith('*'));
    if (lines.length <= 2 && (codeStr.includes('pass') || codeStr.includes('return') || codeStr.includes('// Write your solution'))) {
      const codeWithoutComments = codeStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/#.*$/gm, '').trim();
      if (codeWithoutComments.includes('pass') || codeWithoutComments.endsWith('{}') || codeWithoutComments.endsWith('return {};')) {
        setValidationError('Please write your solution before running or submitting.');
        return false;
      }
    }
    return true;
  };

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    setValidationError(null);
    if (!value || value === templates[lang] || value === DEFAULT_STARTER_TEMPLATES[lang]) {
      onChange(templates[newLang] || DEFAULT_STARTER_TEMPLATES[newLang]);
    }
  };

  const handleReset = () => {
    onChange(templates[lang] || DEFAULT_STARTER_TEMPLATES[lang]);
    setEvalResult(null);
    setValidationError(null);
  };

  // Run Code: Runs ONLY against sample test cases (isHidden: false)
  const handleRunCode = async () => {
    if (!validateCodeInput(currentCode)) return;

    setExecuting(true);
    setActiveTab('result');
    setValidationError(null);
    try {
      const sampleCases = (question.testCases || []).filter((tc: any) => !tc.isHidden);
      const targetCases = sampleCases.length > 0 ? sampleCases : [{ input: question.sampleInput, output: question.sampleOutput, isHidden: false }];

      const res = await apiRequest('/assessments/run-code', {
        method: 'POST',
        body: JSON.stringify({
          code: currentCode,
          language: lang,
          testCases: targetCases,
          customInput: customInput.trim() || undefined,
        }),
      });
      setEvalResult(res);
    } catch (err: any) {
      setEvalResult({
        verdict: 'Compilation Error',
        passedTestCases: 0,
        totalTestCases: 1,
        executionTimeMs: 0,
        memoryUsageMb: 0,
        testCaseResults: [],
        stdout: err.message || 'Execution error',
      });
    } finally {
      setExecuting(false);
    }
  };

  // Submit Question: Runs against ALL test cases (hidden & visible)
  const handleSingleQuestionSubmit = async () => {
    if (!validateCodeInput(currentCode)) return;

    setSubmittingQ(true);
    setActiveTab('result');
    try {
      const res = await apiRequest('/assessments/run-code', {
        method: 'POST',
        body: JSON.stringify({
          code: currentCode,
          language: lang,
          testCases: question.testCases || [],
        }),
      });
      setEvalResult(res);
      onSubmitQuestion(currentCode, lang);
    } catch (err: any) {
      alert(err.message || 'Single question submit failed');
    } finally {
      setSubmittingQ(false);
    }
  };

  const diffBadgeColor = (diff: string) => {
    if (diff === 'Easy') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (diff === 'Hard') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl space-y-0">
      {/* Validation Warning Notice */}
      {validationError && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 px-5 text-amber-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-amber-400 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Top IDE Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-white tracking-wider">{question.title || 'Coding Challenge'}</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffBadgeColor(question.difficulty)}`}>
            {question.difficulty || 'Medium'}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
            {question.topic || 'Algorithms'}
          </span>
          {isQuestionSubmitted && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Submitted
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLangChange(l)}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                  lang === l
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l === 'cpp' ? 'C++' : l === 'javascript' ? 'JS' : l}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Reset Starter Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={executing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{executing ? 'Executing Sample...' : 'Run Code (Sample)'}</span>
          </button>

          {/* Submit Question Solution Button */}
          <button
            type="button"
            onClick={handleSingleQuestionSubmit}
            disabled={submittingQ}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 fill-white" />
            <span>{submittingQ ? 'Evaluating Hidden...' : 'Submit Question'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column LeetCode Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[480px]">
        {/* Left Column: Problem Description & Testcases */}
        <div className="flex flex-col bg-slate-900/50">
          <div className="flex border-b border-slate-800 bg-slate-900">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-5 py-3 text-xs font-bold transition-all ${
                activeTab === 'problem' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('testcase')}
              className={`px-5 py-3 text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'testcase' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Custom Input
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`px-5 py-3 text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'result' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Evaluation Console
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[440px] space-y-5 text-xs text-slate-300">
            {activeTab === 'problem' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Problem Statement</h4>
                  <p className="leading-relaxed whitespace-pre-wrap">{question.questionText}</p>
                </div>

                {question.inputFormat && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase block">Input Format</span>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                      {question.inputFormat}
                    </pre>
                  </div>
                )}

                {question.outputFormat && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase block">Output Format</span>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                      {question.outputFormat}
                    </pre>
                  </div>
                )}

                {question.sampleInput && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Example Input</span>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200">
                        {question.sampleInput}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase block mb-1">Example Output</span>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                        {question.sampleOutput}
                      </pre>
                    </div>
                  </div>
                )}

                {question.constraints && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase block">Constraints & Limits</span>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-200/80">
                      {question.constraints}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testcase' && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Custom Test Input</span>
                <textarea
                  rows={6}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom input parameters..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">
                  Click <strong>Run Code (Sample)</strong> to test your code with this custom input.
                </p>
              </div>
            )}

            {activeTab === 'result' && (
              <div className="space-y-4">
                {!evalResult ? (
                  <p className="text-slate-500 italic">Click "Run Code (Sample)" or "Submit Question" to compile and view testcase evaluation results.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-black px-3 py-1 rounded-xl border ${
                            evalResult.verdict === 'Accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {evalResult.verdict}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {evalResult.passedTestCases} / {evalResult.totalTestCases} Test Cases Passed
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>Time: {evalResult.executionTimeMs}ms</span>
                        <span>Memory: {evalResult.memoryUsageMb}MB</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(evalResult.testCaseResults || []).map((tr: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                            tr.status === 'PASSED'
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <span>{tr.isHidden ? '🔒 Hidden Evaluation Case' : '👁️ Visible Sample Case'} #{idx + 1}</span>
                          <span>{tr.status}</span>
                        </div>
                      ))}
                    </div>

                    {evalResult.stdout && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Stdout Console Output</span>
                        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                          {evalResult.stdout}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="flex flex-col bg-slate-950 p-4">
          <textarea
            rows={20}
            value={currentCode}
            onChange={(e) => { setValidationError(null); onChange(e.target.value); }}
            spellCheck={false}
            className="w-full h-full bg-slate-950 font-mono text-xs text-indigo-200 focus:outline-none resize-none leading-relaxed p-2"
            style={{ minHeight: '400px', tabSize: 2 }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newVal = currentCode.substring(0, start) + '  ' + currentCode.substring(end);
                onChange(newVal);
                setTimeout(() => {
                  e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                }, 0);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const AssessmentTakePage: React.FC = () => {
  const [assignedList, setAssignedList] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [preGateAssessment, setPreGateAssessment] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Pre-Exam Permission Gate States
  const [camPermitted, setCamPermitted] = useState(false);
  const [micPermitted, setMicPermitted] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const gateVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submittedQIds, setSubmittedQIds] = useState<string[]>([]);
  const [proctorLogs, setProctorLogs] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardware Media Stream Cleanup
  const stopAllHardwareMedia = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      activeStreamRef.current = null;
    }
    if (gateVideoRef.current) {
      gateVideoRef.current.srcObject = null;
    }
    setCamPermitted(false);
    setMicPermitted(false);
  }, []);

  useEffect(() => {
    async function loadAssigned() {
      try {
        const res = await apiRequest('/assessments/assigned');
        setAssignedList(res.assessments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssigned();
  }, []);

  const handleOpenPreGate = async (assessmentId: string) => {
    try {
      const data = await apiRequest(`/assessments/${assessmentId}`);
      setPreGateAssessment(data);
      setCamPermitted(false);
      setMicPermitted(false);
      setFullscreenActive(!!document.fullscreenElement);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCamPermitted(true);
        setMicPermitted(true);
        activeStreamRef.current = stream;
        if (gateVideoRef.current) {
          gateVideoRef.current.srcObject = stream;
          gateVideoRef.current.play();
        }
      } catch (err) {
        console.warn('Pre-gate media request denied:', err);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initialize pre-exam check');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setFullscreenActive(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreenActive(false));
    }
  };

  const handleConfirmStartExam = () => {
    if (!camPermitted || !micPermitted) {
      return alert('Camera and Microphone permissions are mandatory to start proctored assessment.');
    }
    if (!fullscreenActive && !document.fullscreenElement) {
      handleToggleFullscreen();
    }

    // Restore saved code from local storage for each question
    const savedAnswers: Record<string, any> = {};
    (preGateAssessment.questions || []).forEach((q: any) => {
      const stored = localStorage.getItem(`assessment_${preGateAssessment.id}_q_${q.id}`);
      if (stored) {
        savedAnswers[q.id] = stored;
      }
    });

    setActiveAssessment(preGateAssessment);
    setCurrentQIndex(0);
    setTimeLeft(preGateAssessment.durationMinutes * 60);
    setAnswers(savedAnswers);
    setSubmittedQIds([]);
    setProctorLogs([]);
    setSubmissionResult(null);
    setPreGateAssessment(null);
  };

  // Automatic Code Recovery & Auto-save to LocalStorage
  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    if (activeAssessment) {
      try {
        localStorage.setItem(`assessment_${activeAssessment.id}_q_${questionId}`, String(val));
      } catch (e) {}
    }
  };

  const handleQuestionSubmitSuccess = (questionId: string, code: string) => {
    handleAnswerChange(questionId, code);
    if (!submittedQIds.includes(questionId)) {
      setSubmittedQIds((prev) => [...prev, questionId]);
    }
  };

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeAssessment || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssessment, timeLeft]);

  const handleProctorEvent = useCallback((event: { event: string; description: string; severity: string }) => {
    setProctorLogs((prev) => [...prev, { ...event, timestamp: new Date().toISOString() }]);
  }, []);

  const handleFinalSubmitExam = async () => {
    if (!activeAssessment || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    // Stop all media tracks immediately on submission
    stopAllHardwareMedia();

    try {
      const res = await apiRequest(`/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers,
          proctoringLogs: proctorLogs,
        }),
      });
      setSubmissionResult(res);

      // Clear local storage backups
      (activeAssessment.questions || []).forEach((q: any) => {
        localStorage.removeItem(`assessment_${activeAssessment.id}_q_${q.id}`);
      });

      setActiveAssessment(null);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      const updated = await apiRequest('/assessments/assigned');
      setAssignedList(updated.assessments || []);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => { stopAllHardwareMedia(); };
  }, [stopAllHardwareMedia]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-8 text-center text-indigo-400 font-semibold">Loading Department Coding Assessments...</div>;
  }

  // Pre-Exam Hard-Gate Modal
  if (preGateAssessment) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 w-full max-w-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase">Pre-Assessment Proctor Verification</span>
              <h2 className="text-xl font-extrabold text-white">{preGateAssessment.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="relative w-full h-36 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video ref={gateVideoRef} muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
              {!camPermitted && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Camera className="w-6 h-6 mb-1 text-rose-400" />
                  <span>Camera Stream Blocked</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                camPermitted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Webcam Stream
                </span>
                <span>{camPermitted ? '✓ Active' : '✗ Required'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                micPermitted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <span className="flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Microphone Stream
                </span>
                <span>{micPermitted ? '✓ Active' : '✗ Required'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                fullscreenActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`} onClick={handleToggleFullscreen}>
                <span className="flex items-center gap-2">
                  <Maximize className="w-4 h-4" /> Full-Screen Mode
                </span>
                <span>{fullscreenActive ? '✓ Active' : 'Click to Enable'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => { stopAllHardwareMedia(); setPreGateAssessment(null); }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmStartExam}
              disabled={!camPermitted || !micPermitted}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <span>Begin Multi-Question Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Multi-Question Exam View
  if (activeAssessment) {
    const questionsList = activeAssessment.questions || [];
    const currentQ = questionsList[currentQIndex];
    const answeredCount = Object.keys(answers).filter(k => !!answers[k]).length;
    const unansweredCount = questionsList.length - answeredCount;

    return (
      <div className="space-y-6 relative pb-20">
        <ExamProctorOverlay onLogEvent={handleProctorEvent} />

        {/* Top Assessment Header & Timer */}
        <div className="sticky top-16 z-30 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Enterprise Multi-Question Assessment</span>
            <h2 className="text-lg font-extrabold text-white">{activeAssessment.title}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-base">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              Submit Entire Assessment
            </button>
          </div>
        </div>

        {/* Question Navigation Bar (Q1, Q2, Q3...) */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            {questionsList.map((q: any, idx: number) => {
              const isSubmitted = submittedQIds.includes(q.id);
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentQIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                      : isSubmitted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isAnswered
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {isSubmitted && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button
              disabled={currentQIndex === questionsList.length - 1}
              onClick={() => setCurrentQIndex(prev => Math.min(questionsList.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Question Display */}
        {currentQ && (
          <div className="space-y-4">
            {currentQ.type === 'CODING' ? (
              <LeetCodeIDE
                question={currentQ}
                value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : currentQ.starterTemplates?.javascript || currentQ.codeTemplate || ''}
                onChange={(val) => handleAnswerChange(currentQ.id, val)}
                onSubmitQuestion={(code) => handleQuestionSubmitSuccess(currentQ.id, code)}
                isQuestionSubmitted={submittedQIds.includes(currentQ.id)}
              />
            ) : (
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <p className="text-base font-semibold text-white">{currentQ.questionText}</p>
                {(currentQ.options || []).map((opt: string, oIdx: number) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleAnswerChange(currentQ.id, opt)}
                    className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all ${
                      answers[currentQ.id] === opt
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold mr-2 text-indigo-400">{String.fromCharCode(65 + oIdx)}.</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Final Submission Summary Confirmation Dialog */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 w-full max-w-lg space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <HelpCircle className="w-7 h-7 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-extrabold text-white">Confirm Assessment Final Submission</h3>
                  <p className="text-xs text-slate-400">Please review your question progress before submitting.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px]">Total Questions</span>
                  <span className="text-xl font-bold text-white block">{questionsList.length}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px]">Answered / Code Saved</span>
                  <span className="text-xl font-bold text-emerald-400 block">{answeredCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px]">Unanswered</span>
                  <span className="text-xl font-bold text-amber-400 block">{unansweredCount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px]">Submitted Coding Solutions</span>
                  <span className="text-xl font-bold text-indigo-400 block">{submittedQIds.length}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Return to Questions
                </button>

                <button
                  onClick={handleFinalSubmitExam}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Evaluating Entire Test...' : 'Confirm Final Submission'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Code2 className="w-7 h-7 text-indigo-400" />
          Enterprise Coding Assessments <span className="gradient-text">(LeetCode Experience)</span>
        </h1>
        <p className="text-sm text-slate-400">
          Solve proctored departmental coding assessments in Java, Python, C++, C, or JavaScript inside a modern online IDE.
        </p>
      </div>

      {submissionResult && (
        <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 text-white space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3 text-emerald-400 font-bold">
            <CheckCircle className="w-6 h-6" />
            <h3 className="text-lg">Assessment Submitted & Code Evaluated!</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold text-sm">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-xs block uppercase">Obtained Marks</span>
              <span className="text-2xl text-emerald-400 font-black">{submissionResult.obtainedMarks} / {submissionResult.totalMarks}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-xs block uppercase">Malpractice Score</span>
              <span className={`text-2xl font-black ${submissionResult.malpracticeScore > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {submissionResult.malpracticeScore}/100
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-xs block uppercase">Proctoring Status</span>
              <span className="text-emerald-300 font-bold">Vision Logs Verified (Camera & Mic Terminated)</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignedList.map((test) => (
          <div key={test.id} className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <FileQuestion className="w-4 h-4" />
                  {test.questionCount} Questions
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {test.durationMinutes} Mins
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{test.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{test.description}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {test.isCompleted ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Score: {test.obtainedMarks} / {test.totalMarks}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenPreGate(test.id)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start LeetCode Coding Exam</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
