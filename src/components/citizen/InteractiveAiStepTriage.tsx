import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Activity,
  Brain,
  User,
  Shield,
  Heart,
  Droplet,
  Flame,
  Wind,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  AlertTriangle,
  Bluetooth,
  FileText,
  Building2,
  ArrowRight,
  Radio,
  HelpCircle
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';

export interface StepTriageData {
  category: string;
  categoryKey: string;
  consciousness: string;
  patientAge: string;
  patientAgeLabel: string;
  patientGender: string;
  patientName: string;
  symptomDuration: string;
  redFlags: {
    diabetes: boolean;
    hypertension: boolean;
    bloodThinners: boolean;
    heartDisease: boolean;
    pregnancy: boolean;
  };
  vitals: {
    spo2: number;
    pulse: number;
    bp: string;
  };
  transcriptHistory: string[];
}

interface InteractiveAiStepTriageProps {
  onDataChange: (data: StepTriageData) => void;
  onGenerateReport: () => void;
  onSubmitDispatch: () => void;
  onPreviewPdf: () => void;
  isSubmitting?: boolean;
  isReportGenerated?: boolean;
  selectedHospitalName?: string;
  defaultData?: Partial<StepTriageData>;
}

export const InteractiveAiStepTriage: React.FC<InteractiveAiStepTriageProps> = ({
  onDataChange,
  onGenerateReport,
  onSubmitDispatch,
  onPreviewPdf,
  isSubmitting = false,
  isReportGenerated = false,
  selectedHospitalName = 'GSVM Medical College & Hospital',
  defaultData
}) => {
  // Step tracker: 1 = Emergency Category, 2 = Consciousness, 3 = Patient Age & Gender, 4 = Medical Red Flags, 5 = Vitals, 6 = Summary & Actions
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveSpeechText, setLiveSpeechText] = useState<string>('');
  const [detectedVoiceNotice, setDetectedVoiceNotice] = useState<string>('');
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);

  const speechRecognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // Core Clinical State
  const [triageData, setTriageData] = useState<StepTriageData>({
    category: defaultData?.category || 'Chest Pain / Acute Cardiac',
    categoryKey: defaultData?.categoryKey || 'chest_pain',
    consciousness: defaultData?.consciousness || 'Alert',
    patientAge: defaultData?.patientAge || '45',
    patientAgeLabel: defaultData?.patientAgeLabel || '13–60',
    patientGender: defaultData?.patientGender || 'Male',
    patientName: defaultData?.patientName || 'Amit Kumar',
    symptomDuration: defaultData?.symptomDuration || '< 30 mins',
    redFlags: defaultData?.redFlags || {
      diabetes: false,
      hypertension: true,
      bloodThinners: false,
      heartDisease: true,
      pregnancy: false
    },
    vitals: defaultData?.vitals || {
      spo2: 96,
      pulse: 98,
      bp: '130/85'
    },
    transcriptHistory: []
  });

  // Step Question Definitions with Speech synthesis text & speech hints
  const stepQuestions = [
    {
      step: 1,
      id: 'category',
      title: '1. Emergency Type / मुख्य समस्या',
      hindiPrompt: 'Patient ko kis tarah ki emergency ya takleef ho rahi hai?',
      speechText: 'Patient ko kya emergency takleef ho rahi hai? Jaise Chest Pain, Accident, Stroke, ya Saans lene me dikkat?',
      sampleVoiceHints: [
        'Chest pain ho raha hai',
        'Accident aur bleeding hui hai',
        'Lakwa / Stroke attack',
        'Saans lene me dikkat'
      ],
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      step: 2,
      id: 'consciousness',
      title: '2. Consciousness / होश की स्थिति',
      hindiPrompt: 'Patient poore hosh mein hai ya behosh/drowsy ho raha hai?',
      speechText: 'Patient hosh mein hai, ya behosh aur chakkar aa rahe hain?',
      sampleVoiceHints: [
        'Poore hosh me hai (Alert)',
        'Chakkar aa rahe hain (Drowsy)',
        'Behosh ho gaya hai (Unconscious)'
      ],
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      step: 3,
      id: 'age',
      title: '3. Patient Age & Gender / उम्र और लिंग',
      hindiPrompt: 'Patient ki umar (Age) kitni hai aur gender kya hai?',
      speechText: 'Patient ki umar kitni hai aur gender kya hai?',
      sampleVoiceHints: [
        'Age 45 saal Purush',
        'Umar 60 saal Mataji',
        'Chhota bachha 8 saal'
      ],
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      step: 4,
      id: 'redflags',
      title: '4. Medical Red Flags / पुरानी बीमारी',
      hindiPrompt: 'Kya patient ko koi purani bimari jaise Sugar, BP ya Heart ki bimari hai?',
      speechText: 'Kya patient ko koi purani bimari jaise Diabetes, BP, Heart disease ya khoon patla karne ki dawai chalti hai?',
      sampleVoiceHints: [
        'Sugar aur High BP hai',
        'Pehle se Heart Stent laga hai',
        'Koi purani bimari nahi hai'
      ],
      icon: Shield,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      step: 5,
      id: 'vitals',
      title: '5. Vitals / ब्लड प्रेशर और ऑक्सीजन',
      hindiPrompt: 'Patient ka BP, Oxygen (SpO2) ya Pulse kitna hai?',
      speechText: 'Patient ka Blood Pressure aur Oxygen level kitna hai?',
      sampleVoiceHints: [
        'Normal 120/80 aur SpO2 98%',
        'BP low hai 90/60',
        'High BP hai 160/100'
      ],
      icon: Heart,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      step: 6,
      id: 'summary',
      title: '6. AI Clinical Review & Report Generation',
      hindiPrompt: 'Sabhi sawalon ke aadhar par AI Report taiyar hai.',
      speechText: 'Aapki emergency report taiyar hai. Niche Submit dabayein aur Hospital Bed lock karein.',
      sampleVoiceHints: [],
      icon: Sparkles,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const currentQ = stepQuestions[currentStep - 1];

  // Request Microphone permission & start speech recognition
  const startSpeechRecognition = async () => {
    if (typeof window === 'undefined') return;

    // First ensure MediaStream Audio permission is requested
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
        setMicPermissionGranted(true);
      }
    } catch (e) {}

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsListening(true);
      isListeningRef.current = true;
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'hi-IN';

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setLiveSpeechText(transcript);
          parseVoiceInputForCurrentStep(transcript);
        }
      };

      rec.onerror = (e: any) => {
        // If aborted or network, keep state friendly
        if (e.error !== 'no-speech') {
          console.warn('Speech rec error:', e.error);
        }
      };

      rec.onend = () => {
        if (isListeningRef.current && currentStep < 6) {
          // Restart if still in listening mode
          try {
            rec.start();
          } catch (err) {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      rec.start();
      speechRecognitionRef.current = rec;
    } catch (err) {
      console.warn('Could not launch speech rec:', err);
      setIsListening(true);
      isListeningRef.current = true;
    }
  };

  const stopSpeechRecognition = () => {
    isListeningRef.current = false;
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Voice Speech Synthesis (Text to Speech) with auto-mic trigger on speech end
  const speakQuestion = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // If voice audio is muted, still trigger mic automatically for input
      if (currentStep < 6) {
        startSpeechRecognition();
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 1.0;
      utterance.lang = 'hi-IN';

      // When AI finishes speaking question, automatically open the mic!
      utterance.onend = () => {
        if (currentStep < 6) {
          startSpeechRecognition();
        }
      };

      utterance.onerror = () => {
        if (currentStep < 6) {
          startSpeechRecognition();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (currentStep < 6) {
        startSpeechRecognition();
      }
    }
  };

  // Speak question & auto-open mic when step changes
  useEffect(() => {
    if (currentQ) {
      setLiveSpeechText('');
      setDetectedVoiceNotice('');
      speakQuestion(currentQ.speechText);
    }
    onDataChange(triageData);
  }, [currentStep]);

  // Helper for auto-advancing after voice detection
  const autoAdvanceToNextQuestion = (ackMessage: string) => {
    setDetectedVoiceNotice(ackMessage);
    playTactileClick();

    // Brief voice confirmation before advancing
    if (isVoiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const ackUtterance = new SpeechSynthesisUtterance(ackMessage);
        ackUtterance.rate = 1.05;
        ackUtterance.lang = 'hi-IN';
        window.speechSynthesis.speak(ackUtterance);
      } catch (e) {}
    }

    setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 1300);
  };

  // Parse Voice Input according to the ACTIVE step
  const parseVoiceInputForCurrentStep = (text: string) => {
    const lower = text.toLowerCase();

    if (currentStep === 1) {
      if (lower.includes('chest') || lower.includes('heart') || lower.includes('cardiac') || lower.includes('dard') || lower.includes('seene')) {
        updateData({ category: 'Chest Pain / Acute Cardiac', categoryKey: 'chest_pain' });
        autoAdvanceToNextQuestion('Seene me dard note kiya gaya. Agla sawal...');
      } else if (lower.includes('accident') || lower.includes('bleed') || lower.includes('trauma') || lower.includes('chot') || lower.includes('khoon')) {
        updateData({ category: 'Severe Trauma / Bleeding', categoryKey: 'trauma' });
        autoAdvanceToNextQuestion('Chot aur bleeding note ki gayi. Agla sawal...');
      } else if (lower.includes('stroke') || lower.includes('paralysis') || lower.includes('lakwa') || lower.includes('kamzor')) {
        updateData({ category: 'Stroke / Paralysis', categoryKey: 'stroke' });
        autoAdvanceToNextQuestion('Stroke ke lakshan note kiye gaye. Agla sawal...');
      } else if (lower.includes('saans') || lower.includes('breath') || lower.includes('asthma') || lower.includes('oxygen')) {
        updateData({ category: 'Breathing / Respiratory Issue', categoryKey: 'breathing' });
        autoAdvanceToNextQuestion('Saans ki takleef note ki gayi. Agla sawal...');
      } else if (lower.includes('burn') || lower.includes('aag') || lower.includes('jal')) {
        updateData({ category: 'Thermal Burn Injury', categoryKey: 'burn' });
        autoAdvanceToNextQuestion('Burn injury note ki gayi. Agla sawal...');
      }
    } else if (currentStep === 2) {
      if (lower.includes('behosh') || lower.includes('unconscious') || lower.includes('behos')) {
        updateData({ consciousness: 'Unconscious' });
        autoAdvanceToNextQuestion('Unconscious state note ki gayi. Agla sawal...');
      } else if (lower.includes('chakkar') || lower.includes('drowsy') || lower.includes('giddy')) {
        updateData({ consciousness: 'Drowsy' });
        autoAdvanceToNextQuestion('Drowsy status note kiya gaya. Agla sawal...');
      } else if (lower.includes('hosh') || lower.includes('alert') || lower.includes('theek')) {
        updateData({ consciousness: 'Alert' });
        autoAdvanceToNextQuestion('Alert status note kiya gaya. Agla sawal...');
      }
    } else if (currentStep === 3) {
      const match = text.match(/(\d{1,2})/);
      let detectedAge = 45;
      if (match && match[1]) {
        detectedAge = parseInt(match[1], 10);
        let label = '13–60';
        if (detectedAge < 1) label = '< 1';
        else if (detectedAge <= 12) label = '1–12';
        else if (detectedAge > 60) label = '> 60';
        updateData({ patientAge: `${detectedAge}`, patientAgeLabel: label });
      }
      if (lower.includes('mahila') || lower.includes('female') || lower.includes('aurat') || lower.includes('mataji') || lower.includes('girl')) {
        updateData({ patientGender: 'Female' });
        autoAdvanceToNextQuestion(`Patient Female, Age ${detectedAge} saal note ki gayi. Agla sawal...`);
      } else {
        updateData({ patientGender: 'Male' });
        autoAdvanceToNextQuestion(`Patient Male, Age ${detectedAge} saal note ki gayi. Agla sawal...`);
      }
    } else if (currentStep === 4) {
      const newFlags = { ...triageData.redFlags };
      let flagNoted = 'History';
      if (lower.includes('sugar') || lower.includes('diabetes')) {
        newFlags.diabetes = true;
        flagNoted = 'Diabetes';
      }
      if (lower.includes('bp') || lower.includes('pressure') || lower.includes('hypertension')) {
        newFlags.hypertension = true;
        flagNoted = 'Hypertension';
      }
      if (lower.includes('heart') || lower.includes('stent') || lower.includes('bypass')) {
        newFlags.heartDisease = true;
        flagNoted = 'Heart disease';
      }
      if (lower.includes('khoon patla') || lower.includes('thinners') || lower.includes('aspirin')) {
        newFlags.bloodThinners = true;
        flagNoted = 'Blood thinners';
      }
      if (lower.includes('nahi') || lower.includes('none') || lower.includes('no')) {
        newFlags.diabetes = false;
        newFlags.hypertension = false;
        newFlags.bloodThinners = false;
        newFlags.heartDisease = false;
        flagNoted = 'No chronic disease';
      }
      updateData({ redFlags: newFlags });
      autoAdvanceToNextQuestion(`${flagNoted} note kiya gaya. Agla sawal...`);
    } else if (currentStep === 5) {
      if (lower.includes('low') || lower.includes('kam') || lower.includes('90')) {
        updateData({ vitals: { bp: '90/60', spo2: 95, pulse: 104 } });
        autoAdvanceToNextQuestion('Low BP 90/60 note kiya gaya. Report generate ki ja rahi hai...');
      } else if (lower.includes('high') || lower.includes('jyada') || lower.includes('160') || lower.includes('170')) {
        updateData({ vitals: { bp: '165/100', spo2: 97, pulse: 110 } });
        autoAdvanceToNextQuestion('High BP 165/100 note kiya gaya. Report generate ki ja rahi hai...');
      } else {
        updateData({ vitals: { bp: '120/80', spo2: 98, pulse: 78 } });
        autoAdvanceToNextQuestion('Vitals 120/80 note kiya gaya. Report generate ki ja rahi hai...');
      }
    }
  };

  const updateData = (partial: Partial<StepTriageData>) => {
    setTriageData((prev) => {
      const updated = { ...prev, ...partial };
      onDataChange(updated);
      return updated;
    });
  };

  const handleNextStep = () => {
    playConfirmChime();
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    playTactileClick();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    playTactileClick();
    setCurrentStep(1);
    setLiveSpeechText('');
    setDetectedVoiceNotice('');
  };

  // Direct sample voice trigger (tests speech recognition without requiring external hardware)
  const handleSimulateVoiceHint = (hint: string) => {
    playTactileClick();
    setLiveSpeechText(hint);
    parseVoiceInputForCurrentStep(hint);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden text-left space-y-5 p-5 sm:p-6 animate-in fade-in duration-200">
      
      {/* 1. Header Navigation Bar with Steps & Voice Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black tracking-wide border border-blue-200/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Interactive AI Clinical Assistant</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Step {currentStep} of 6
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-1">
            Question-by-Question Voice &amp; Tap Triage
          </h3>
        </div>

        {/* Audio Speech Synthesis Toggle & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setIsVoiceEnabled(!isVoiceEnabled);
              if (isVoiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isVoiceEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Toggle AI voice questions aloud"
          >
            {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice: {isVoiceEnabled ? 'ON' : 'Mute'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Restart Question Triage"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Step Progress Stepper Bar */}
      <div className="grid grid-cols-6 gap-1.5">
        {stepQuestions.map((q) => (
          <button
            key={q.step}
            type="button"
            onClick={() => {
              playTactileClick();
              setCurrentStep(q.step);
            }}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              q.step === currentStep
                ? 'bg-blue-600 ring-2 ring-blue-400/40'
                : q.step < currentStep
                ? 'bg-emerald-500'
                : 'bg-slate-200'
            }`}
            title={`Step ${q.step}: ${q.title}`}
          />
        ))}
      </div>

      {/* 3. AI Question Banner (Active Question Prompt with Big Auto-Mic) */}
      <div className={`p-4 sm:p-5 rounded-2xl ${currentQ.bgColor} border border-slate-200/80 space-y-3 relative overflow-hidden`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 ${currentQ.color}`}>
              <currentQ.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>{currentQ.title}</span>
                {isListening && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-red-100 text-red-700 text-[9px] font-black animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Mic Active
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug mt-0.5">
                "{currentQ.hindiPrompt}"
              </h4>
            </div>
          </div>

          {/* Big Glowing Mic Button (Auto-opens or Tap to toggle) */}
          <div className="relative">
            {isListening && (
              <div className="absolute -inset-2 rounded-2xl bg-red-500/20 animate-ping" />
            )}
            <button
              type="button"
              onClick={() => {
                if (isListening) stopSpeechRecognition();
                else startSpeechRecognition();
              }}
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-300 shadow-red-500/40'
                  : 'bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 shadow-blue-500/10'
              }`}
              title={isListening ? 'Mic is listening... Tap to pause' : 'Tap to speak your answer'}
            >
              {isListening ? (
                <Mic className="w-6 h-6 animate-bounce text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Live speech feedback & Detected feedback pill */}
        <div className="space-y-1.5">
          {isListening && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-white/90 p-2.5 rounded-xl border border-red-200 shadow-xs animate-in fade-in duration-150">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="italic">
                {liveSpeechText ? `Heard: "${liveSpeechText}"` : 'Listening now... Aap bol sakte hain'}
              </span>
            </div>
          )}

          {detectedVoiceNotice && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span>{detectedVoiceNotice}</span>
            </div>
          )}
        </div>

        {/* Quick Voice Hints (Can tap to test voice instantly) */}
        {currentQ.sampleVoiceHints && currentQ.sampleVoiceHints.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">Tap to test speech:</span>
            {currentQ.sampleVoiceHints.map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateVoiceHint(hint)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
              >
                "{hint}"
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. ACTIVE STEP QUESTION CONTENT & QUICK INTERACTION BUTTONS */}
      
      {/* ---------------- STEP 1: EMERGENCY CATEGORY ---------------- */}
      {currentStep === 1 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-700">
            Select or speak the primary symptom / emergency:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { key: 'chest_pain', label: 'Chest Pain / Heart Attack', desc: 'Severe chest pressure, radiating arm pain', icon: Activity, color: 'text-red-600' },
              { key: 'trauma', label: 'Severe Trauma / Bleeding', desc: 'Accident, deep wound, heavy blood loss', icon: Droplet, color: 'text-red-600' },
              { key: 'stroke', label: 'Stroke / Paralysis', desc: 'Face drooping, slurred speech, weakness', icon: Brain, color: 'text-purple-600' },
              { key: 'breathing', label: 'Breathing / Asthma Issue', desc: 'Severe shortness of breath, low oxygen', icon: Wind, color: 'text-cyan-600' },
              { key: 'burn', label: 'Thermal Burn Injury', desc: 'Fire, steam or chemical burn burns', icon: Flame, color: 'text-orange-600' }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  playTactileClick();
                  updateData({ category: item.label, categoryKey: item.key });
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  triageData.categoryKey === item.key
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/30 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium pt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- STEP 2: CONSCIOUSNESS LEVEL ---------------- */}
      {currentStep === 2 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-700">
            Is the patient alert, drowsy, or completely unresponsive?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Alert',
                label: '🟢 Alert / होश में है',
                desc: 'Responds clearly to voice and questions.',
                border: 'border-emerald-300',
                activeBg: 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400/30'
              },
              {
                id: 'Drowsy',
                label: '🟡 Drowsy / चक्कर / सुस्त',
                desc: 'Disoriented, slurred responses, faint.',
                border: 'border-amber-300',
                activeBg: 'bg-amber-50 text-amber-900 border-amber-500 ring-2 ring-amber-400/30'
              },
              {
                id: 'Unconscious',
                label: '🔴 Unconscious / बेहोश',
                desc: 'No response to stimuli. Immediate ICU Priority.',
                border: 'border-red-300',
                activeBg: 'bg-red-50 text-red-900 border-red-500 ring-2 ring-red-400/30'
              }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playTactileClick();
                  updateData({ consciousness: item.id });
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                  triageData.consciousness === item.id
                    ? item.activeBg
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-xs font-black">{item.label}</div>
                <div className="text-[11px] text-slate-600 font-medium">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- STEP 3: PATIENT AGE & GENDER ---------------- */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Age bracket pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Patient Age (Years):</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: '< 1', val: '0.8', label: 'Infant (<1)' },
                  { key: '1–12', val: '8', label: 'Child (1-12)' },
                  { key: '13–60', val: '45', label: 'Adult (13-60)' },
                  { key: '> 60', val: '68', label: 'Senior (>60)' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateData({ patientAge: item.val, patientAgeLabel: item.key });
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      triageData.patientAgeLabel === item.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {item.key}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={triageData.patientAge}
                onChange={(e) => updateData({ patientAge: e.target.value })}
                placeholder="Exact age (e.g. 45)"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Gender / लिंग:</label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateData({ patientGender: g });
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      triageData.patientGender === g
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={triageData.patientName}
                onChange={(e) => updateData({ patientName: e.target.value })}
                placeholder="Patient Name (Optional)"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
              />
            </div>

          </div>
        </div>
      )}

      {/* ---------------- STEP 4: MEDICAL RED FLAGS / COMORBIDITIES ---------------- */}
      {currentStep === 4 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-700">
            Select all existing chronic conditions (Tap to toggle):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'hypertension', label: 'High Blood Pressure (Hypertension)', desc: 'Regular BP medications' },
              { id: 'diabetes', label: 'Diabetes Mellitus / Sugar', desc: 'Insulin or oral hypoglycemics' },
              { id: 'heartDisease', label: 'Prior Heart Disease / Stent', desc: 'Previous cardiac interventions' },
              { id: 'bloodThinners', label: 'Blood Thinners (Anticoagulants)', desc: 'Aspirin, Warfarin, Clopidogrel' },
              { id: 'pregnancy', label: 'Active Pregnancy', desc: 'Obstetric emergency protocols' }
            ].map((flag) => {
              const isChecked = triageData.redFlags[flag.id as keyof typeof triageData.redFlags];
              return (
                <button
                  key={flag.id}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    updateData({
                      redFlags: {
                        ...triageData.redFlags,
                        [flag.id]: !isChecked
                      }
                    });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{flag.label}</div>
                    <div className="text-[10px] text-slate-500">{flag.desc}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- STEP 5: VITALS & BLE SYNC ---------------- */}
      {currentStep === 5 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Enter vital signs or select preset:</span>
            <span className="text-blue-600 font-mono text-[10px]">Real-time Telemetry</span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/90 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">BP (mmHg)</div>
              <input
                type="text"
                value={triageData.vitals.bp}
                onChange={(e) =>
                  updateData({ vitals: { ...triageData.vitals, bp: e.target.value } })
                }
                className="w-full text-center text-sm font-mono font-black bg-white border border-slate-200 rounded-lg py-1 mt-1 text-slate-900"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">SpO2 (%)</div>
              <input
                type="number"
                value={triageData.vitals.spo2}
                onChange={(e) =>
                  updateData({ vitals: { ...triageData.vitals, spo2: parseInt(e.target.value) || 96 } })
                }
                className="w-full text-center text-sm font-mono font-black bg-white border border-slate-200 rounded-lg py-1 mt-1 text-slate-900"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Pulse (bpm)</div>
              <input
                type="number"
                value={triageData.vitals.pulse}
                onChange={(e) =>
                  updateData({ vitals: { ...triageData.vitals, pulse: parseInt(e.target.value) || 98 } })
                }
                className="w-full text-center text-sm font-mono font-black bg-white border border-slate-200 rounded-lg py-1 mt-1 text-slate-900"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                updateData({ vitals: { bp: '120/80', spo2: 98, pulse: 76 } });
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Normal (120/80, 98%)
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                updateData({ vitals: { bp: '90/60', spo2: 94, pulse: 112 } });
              }}
              className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer"
            >
              Low BP / Shock (90/60)
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                updateData({ vitals: { bp: '170/105', spo2: 97, pulse: 88 } });
              }}
              className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 cursor-pointer"
            >
              Hypertensive Crisis (170/105)
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 6: SUMMARY & ACTION BUTTONS ---------------- */}
      {currentStep === 6 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Summary of all 5 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Category</div>
              <div className="text-xs font-black text-slate-900 truncate">{triageData.category}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Consciousness</div>
              <div className="text-xs font-black text-slate-900">{triageData.consciousness}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Patient Age / Gender</div>
              <div className="text-xs font-black text-slate-900">{triageData.patientAge} Yrs ({triageData.patientGender})</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">BP &amp; SpO2 Vitals</div>
              <div className="text-xs font-black text-emerald-900">{triageData.vitals.bp} mmHg • {triageData.vitals.spo2}%</div>
            </div>
          </div>

          {/* Medical Red Flags & Blood Thinning Review Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-500" />
                <span>Captured Medical History &amp; Red Flags:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                BP: {triageData.vitals.bp} mmHg
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {/* Blood Thinners Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                triageData.redFlags.bloodThinners
                  ? 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-300'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}>
                {triageData.redFlags.bloodThinners ? '⚠️ On Blood Thinners' : '✓ No Blood Thinners'}
              </span>

              {/* Hypertension Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                triageData.redFlags.hypertension
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}>
                {triageData.redFlags.hypertension ? '⚠️ Hypertension (High BP)' : '✓ Normal BP History'}
              </span>

              {/* Diabetes Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                triageData.redFlags.diabetes
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}>
                {triageData.redFlags.diabetes ? '⚠️ Diabetes Mellitus' : '✓ Non-Diabetic'}
              </span>

              {/* Heart Disease Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                triageData.redFlags.heartDisease
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}>
                {triageData.redFlags.heartDisease ? '⚠️ Prior Heart Condition' : '✓ No Cardiac History'}
              </span>

              {/* Pregnancy if true */}
              {triageData.redFlags.pregnancy && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                  ⚠️ Active Pregnancy
                </span>
              )}
            </div>
          </div>

          {/* Hospital Match Pill */}
          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Target ER: {selectedHospitalName}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
              Fast-Track Locked
            </span>
          </div>

          {/* ACTION BUTTON 1: GENERATE AI CLINICAL REPORT */}
          <button
            type="button"
            onClick={onGenerateReport}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-98 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate AI Clinical Report &amp; Triage Code</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </button>

          {/* ACTION BUTTON 2: SUBMIT INTAKE (DIRECT TRANSMIT & BED LOCK) */}
          <button
            type="button"
            onClick={onSubmitDispatch}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting to Live Hospital Reception Grid...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Intake &amp; Lock ER Bed (Direct Transmit)</span>
              </>
            )}
          </button>

          {/* View PDF modal preview link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onPreviewPdf}
              className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Preview / Print Formatted ABDM Medical Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 5. Bottom Navigation Controls (Previous / Next Buttons) */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
            currentStep === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        )}
      </div>

    </div>
  );
};
