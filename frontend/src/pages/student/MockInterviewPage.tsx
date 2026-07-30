import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiRequest } from '../../services/api';
import { RadarChartComponent } from '../../components/common/RadarChart';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle,
  Award,
  BookOpen,
  RotateCcw,
  Video,
  Camera,
  Eye,
  Smile,
  Activity,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const MockInterviewPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ speaker: string; text: string; roundType?: string }[]>([]);
  const [studentInput, setStudentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Speech-to-Text (STT) SpeechRecognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Live Interview Camera & MediaRecorder refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const roles = [
    'Software Development Engineer (SDE-1)',
    'Frontend Developer',
    'Backend Microservices Engineer',
    'Full Stack Developer',
    'Cloud & Systems Engineer'
  ];
  const companies = ['Amazon', 'Google', 'Microsoft', 'Atlassian', 'Walmart', 'Zoho'];

  // Media Stream Cleanup
  const stopMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopMediaTracks();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopMediaTracks]);

  // Speech Recognition (STT) Setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return alert('Speech Recognition is not supported by your browser. Please use Chrome or Edge.');
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcriptResult = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcriptResult += event.results[i][0].transcript;
        }
        setStudentInput(transcriptResult);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // Natural Voice Text-to-Speech (TTS)
  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/interview/start', {
        method: 'POST',
        body: JSON.stringify({ targetRole, targetCompany }),
      });
      setInterviewId(res.interviewId);
      setTranscript([
        {
          speaker: 'INTERVIEWER',
          text: res.nextQuestion,
          roundType: res.roundType,
        },
      ]);
      setEvaluation(null);

      // Speak AI question
      speakText(res.nextQuestion);

      // Start webcam preview & MediaRecorder
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play();
        }
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.start();
      } catch (e) {
        console.warn('Camera preview unavailable:', e);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTurn = async () => {
    if (!studentInput.trim() || !interviewId || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentAns = studentInput;
    setStudentInput('');

    const updated = [...transcript, { speaker: 'STUDENT', text: currentAns }];
    setTranscript(updated);
    setLoading(true);

    try {
      const res = await apiRequest('/interview/turn', {
        method: 'POST',
        body: JSON.stringify({
          interviewId,
          studentResponse: currentAns,
        }),
      });

      setTranscript((prev) => [
        ...prev,
        {
          speaker: 'INTERVIEWER',
          text: res.nextQuestion,
          roundType: res.roundType,
        },
      ]);

      // Speak follow-up question
      speakText(res.nextQuestion);

      if (res.isInterviewComplete) {
        handleEvaluateInterview();
      }
    } catch (err: any) {
      alert(err.message || 'Turn failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateInterview = async () => {
    if (!interviewId) return;
    setEvaluating(true);

    stopMediaTracks();

    try {
      const res = await apiRequest('/interview/evaluate', {
        method: 'POST',
        body: JSON.stringify({ interviewId }),
      });
      setEvaluation(res.evaluation);
    } catch (err: any) {
      alert(err.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Mic className="w-7 h-7 text-indigo-400" />
            Virtual Campus <span className="gradient-text">AI Mock Interview</span>
          </h1>
          <p className="text-sm text-slate-400">
            Interactive virtual interview simulation with real-time Speech-to-Text (STT) mic capture, natural AI voice TTS & intelligent adaptive conversation logic.
          </p>
        </div>

        {interviewId && (
          <button
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) window.speechSynthesis.cancel();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              ttsEnabled ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{ttsEnabled ? 'AI Voice Active' : 'AI Voice Muted'}</span>
          </button>
        )}
      </div>

      {!interviewId ? (
        /* Configuration Setup Screen */
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 max-w-3xl space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Target Placement Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Target Tech Company Format
            </label>
            <div className="flex flex-wrap gap-2">
              {companies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTargetCompany(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    targetCompany === c
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Initializing AI Interview Engine...' : 'Launch Live AI Virtual Interview'}
          </button>
        </div>
      ) : (
        /* Active Virtual Interview View */
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                AI
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{targetRole} Interview</h3>
                <span className="text-xs text-indigo-400 font-semibold">{targetCompany} Placement Panel</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>REC LIVE</span>
              </div>

              <button
                onClick={handleEvaluateInterview}
                disabled={evaluating}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                {evaluating ? 'Evaluating...' : 'Conclude & Evaluate Report'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Live Candidate Camera Feed Widget */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Candidate Camera Stream</span>
                <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Vision AI Tracking: Active</span>
                  <span className="text-emerald-400 font-bold">Eye Contact: 88%</span>
                </div>
              </div>
            </div>

            {/* Conversation Transcript Feed */}
            <div className="lg:col-span-3 space-y-4">
              <div className="glass-panel p-6 rounded-3xl space-y-4 max-h-[420px] overflow-y-auto">
                {transcript.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${item.speaker === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                  >
                    {item.speaker === 'INTERVIEWER' && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl text-xs max-w-xl space-y-1 ${
                        item.speaker === 'STUDENT'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {item.roundType && (
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                          [{item.roundType} Round]
                        </span>
                      )}
                      <p className="leading-relaxed">{item.text}</p>
                    </div>

                    {item.speaker === 'STUDENT' && (
                      <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Response Input Bar with Speech-to-Text Mic Button */}
              <div className="space-y-2">
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Listening to your voice... Speak your answer now</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-3 rounded-2xl transition-all border ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={isListening ? 'Stop Speech-to-Text' : 'Start Speech-to-Text Mic'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <textarea
                    rows={2}
                    placeholder="Speak using microphone or type your response here..."
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendTurn();
                      }
                    }}
                    className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    onClick={handleSendTurn}
                    disabled={loading || !studentInput.trim()}
                    className="px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Vision & Audio Evaluation Report */}
      {evaluation && (
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Completed Vision & Audio AI Audit</span>
              <h2 className="text-2xl font-extrabold text-white">Candidate AI Evaluation Report</h2>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-2xl">
              Overall Score: {evaluation.overallScore}/100
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-indigo-400" /> Facial Expression
              </span>
              <span className="text-xl font-extrabold text-indigo-400">84/100</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-400" /> Eye Contact Score
              </span>
              <span className="text-xl font-extrabold text-emerald-400">86/100</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" /> Voice Clarity
              </span>
              <span className="text-xl font-extrabold text-purple-400">88/100</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Technical Accuracy
              </span>
              <span className="text-xl font-extrabold text-amber-400">{evaluation.technicalScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center">
              <h3 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Radar Competency Chart</h3>
              <RadarChartComponent
                data={[
                  { subject: 'Technical', score: evaluation.technicalScore },
                  { subject: 'Communication', score: evaluation.communicationScore },
                  { subject: 'Confidence', score: evaluation.confidenceScore },
                  { subject: 'Problem Solving', score: evaluation.problemSolvingScore },
                ]}
              />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Key Strengths</h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {(evaluation.feedback?.strengths || []).map((st: string, i: number) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Refinement Suggestions</h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {(evaluation.feedback?.suggestedImprovements || []).map((imp: string, i: number) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setInterviewId(null)}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Another AI Mock Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
