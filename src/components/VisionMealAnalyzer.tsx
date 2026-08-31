import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Layers,
  Code2,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MealSlotBaseline,
  PROTOCOL_MEAL_SLOTS,
  MealAnalysisResult,
  Ingredient,
  SamplePresetMeal
} from '../types';
import { SAMPLE_PRESET_MEALS } from '../data/sampleMeals';

interface VisionMealAnalyzerProps {
  initialSlotHint?: MealSlotBaseline | null;
  shiftDay: number;
  onSaveMeal: (analysis: MealAnalysisResult, imageThumbnail?: string, notes?: string) => void;
  onClose?: () => void;
}

export const VisionMealAnalyzer: React.FC<VisionMealAnalyzerProps> = ({
  initialSlotHint,
  shiftDay,
  onSaveMeal,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'samples'>('samples');
  const [selectedSlotHint, setSelectedSlotHint] = useState<string>(initialSlotHint?.name || 'auto');
  const [imagePreview, setImagePreview] = useState<string | null>(SAMPLE_PRESET_MEALS[0].imageUrl);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(SAMPLE_PRESET_MEALS[0].expectedData);
  const [rawJsonOutput, setRawJsonOutput] = useState<string>(JSON.stringify(SAMPLE_PRESET_MEALS[0].expectedData, null, 2));
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [userNotes, setUserNotes] = useState<string>('');
  const [activeViewMode, setActiveViewMode] = useState<'cards' | 'json'>('cards');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting or switching tabs
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      setAnalysisError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setAnalysisError('Unable to access camera. Please verify camera permissions or upload an image.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(base64);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setAnalysisResult(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SamplePresetMeal) => {
    setImagePreview(sample.imageUrl);
    setSelectedSlotHint(sample.slotName);
    setAnalysisResult(sample.expectedData);
    setRawJsonOutput(JSON.stringify(sample.expectedData, null, 2));
    setAnalysisError(null);
  };

  // Trigger Vision Analysis with Gemini API endpoint
  const runVisionAnalysis = async () => {
    if (!imagePreview) {
      setAnalysisError('Please upload an image, capture a photo, or choose a sample meal.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // If sample image is a remote URL, convert to base64 or pass data
      let base64Payload = imagePreview;
      if (imagePreview.startsWith('http')) {
        // Fetch remote image and convert to base64
        try {
          const imgRes = await fetch(imagePreview);
          const blob = await imgRes.blob();
          const convertedBase64 = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(blob);
          });
          base64Payload = convertedBase64;
        } catch (fetchErr) {
          console.warn('Could not fetch image directly, will send URL or fallback payload:', fetchErr);
        }
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          slotHint: selectedSlotHint === 'auto' ? undefined : selectedSlotHint,
          userNotes: userNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze meal image.');
      }

      setAnalysisResult(data.data);
      setRawJsonOutput(data.rawJson || JSON.stringify(data.data, null, 2));
    } catch (err: any) {
      console.error('Vision analysis failure:', err);
      setAnalysisError(err.message || 'Error communicating with nutrition vision API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recompute macro totals & slot variance when user modifies ingredients table
  const recalculateFromIngredients = (updatedIngredients: Ingredient[], matchedSlotName: string) => {
    const calcCalories = updatedIngredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);
    const calcProtein = updatedIngredients.reduce((sum, ing) => sum + (Number(ing.protein_g) || 0), 0);
    const calcCarbs = updatedIngredients.reduce((sum, ing) => sum + (Number(ing.carbs_g) || 0), 0);
    const calcFat = updatedIngredients.reduce((sum, ing) => sum + (Number(ing.fat_g) || 0), 0);

    const newTotals = {
      calories: Math.round(calcCalories),
      protein_g: Math.round(calcProtein * 10) / 10,
      carbs_g: Math.round(calcCarbs * 10) / 10,
      fat_g: Math.round(calcFat * 10) / 10,
    };

    const targetSlot = PROTOCOL_MEAL_SLOTS.find((s) => s.name === matchedSlotName) || PROTOCOL_MEAL_SLOTS[0];

    const newVariance = {
      calorie_difference: Math.round(newTotals.calories - targetSlot.calories),
      protein_difference_g: Math.round((newTotals.protein_g - targetSlot.protein_g) * 10) / 10,
      carbs_difference_g: Math.round((newTotals.carbs_g - targetSlot.carbs_g) * 10) / 10,
      fat_difference_g: Math.round((newTotals.fat_g - targetSlot.fat_g) * 10) / 10,
    };

    const updatedResult: MealAnalysisResult = {
      meal_name: analysisResult?.meal_name || 'Custom Meal',
      matched_slot: matchedSlotName,
      ingredients: updatedIngredients,
      meal_totals: newTotals,
      slot_variance: newVariance,
    };

    setAnalysisResult(updatedResult);
    setRawJsonOutput(JSON.stringify(updatedResult, null, 2));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    if (!analysisResult) return;
    const newIngredients = [...analysisResult.ingredients];
    const target = { ...newIngredients[index], [field]: value };

    // If estimated weight changed, auto-scale calories & macros proportionally
    if (field === 'estimated_weight_g' && typeof value === 'number' && value > 0) {
      const oldWeight = Number(newIngredients[index].estimated_weight_g) || 100;
      const ratio = value / oldWeight;
      target.calories = Math.round(target.calories * ratio);
      target.protein_g = Math.round(target.protein_g * ratio * 10) / 10;
      target.carbs_g = Math.round(target.carbs_g * ratio * 10) / 10;
      target.fat_g = Math.round(target.fat_g * ratio * 10) / 10;
    }

    newIngredients[index] = target;
    recalculateFromIngredients(newIngredients, analysisResult.matched_slot);
  };

  const handleAddIngredient = () => {
    if (!analysisResult) return;
    const newIng: Ingredient = {
      name: 'Additional Food / Beverage',
      estimated_weight_g: 100,
      calories: 120,
      protein_g: 5,
      carbs_g: 15,
      fat_g: 2,
    };
    const newIngredients = [...analysisResult.ingredients, newIng];
    recalculateFromIngredients(newIngredients, analysisResult.matched_slot);
  };

  const handleDeleteIngredient = (index: number) => {
    if (!analysisResult) return;
    const newIngredients = analysisResult.ingredients.filter((_, i) => i !== index);
    recalculateFromIngredients(newIngredients, analysisResult.matched_slot);
  };

  const handleMatchedSlotChange = (newSlotName: string) => {
    if (!analysisResult) return;
    recalculateFromIngredients(analysisResult.ingredients, newSlotName);
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(rawJsonOutput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSaveToSchedule = () => {
    if (!analysisResult) return;

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    onSaveMeal(analysisResult, imagePreview || undefined, userNotes);
    if (onClose) onClose();
  };

  const matchedSlotInfo = PROTOCOL_MEAL_SLOTS.find(
    (s) => s.name === analysisResult?.matched_slot
  ) || PROTOCOL_MEAL_SLOTS[0];

  return (
    <div className="bg-white rounded-2xl border border-[#E1E3E1] shadow-2xl overflow-hidden flex flex-col max-w-5xl mx-auto text-[#1A1C1E]">
      
      {/* Modal Header */}
      <div className="p-4 sm:p-5 border-b border-[#E1E3E1] flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center border border-[#006C4C]/20 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1A1C1E] flex items-center gap-2">
              Nutrition Vision Engine &amp; Protocol Matcher
            </h2>
            <p className="text-xs text-[#5E6266]">
              Shift Day {shiftDay} • AI Portion &amp; Macronutrient Estimator
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#F1F3F4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">

        {/* Input Source Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#F1F3F4] rounded-lg border border-[#E1E3E1] max-w-md">
          <button
            onClick={() => {
              setActiveTab('samples');
              stopCamera();
            }}
            className={`py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'samples'
                ? 'bg-[#006C4C] text-white shadow-sm'
                : 'text-[#5E6266] hover:text-[#1A1C1E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Preset Meals
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-[#006C4C] text-white shadow-sm'
                : 'text-[#5E6266] hover:text-[#1A1C1E]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Photo
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-[#006C4C] text-white shadow-sm'
                : 'text-[#5E6266] hover:text-[#1A1C1E]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Live Camera
          </button>
        </div>

        {/* Tab 1: Preset Protocol Samples */}
        {activeTab === 'samples' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#5E6266] block uppercase tracking-wider">
              Select 4-Day Shift Protocol Baseline Preset:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {SAMPLE_PRESET_MEALS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                    imagePreview === sample.imageUrl
                      ? 'bg-[#E7F3EF] border-[#006C4C] text-[#1A1C1E] shadow-sm'
                      : 'bg-[#F8F9FA] border-[#E1E3E1] hover:bg-white hover:border-[#006C4C]/40 text-[#1A1C1E]'
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 bg-[#E1E3E1]">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#006C4C] block font-bold truncate">
                      {sample.slotName.split(' ')[0]}
                    </span>
                    <span className="text-xs font-bold block line-clamp-1 leading-tight text-[#1A1C1E]">
                      {sample.title}
                    </span>
                    <span className="text-[10px] text-[#5E6266] block mt-1 font-mono">
                      {sample.expectedData.meal_totals.calories} kcal • {sample.expectedData.meal_totals.protein_g}g P
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Dropzone */}
        {activeTab === 'upload' && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E1E3E1] hover:border-[#006C4C] bg-[#F8F9FA] hover:bg-[#E7F3EF]/40 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#E7F3EF] flex items-center justify-center text-[#006C4C]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1C1E]">
                  Drop your meal photo here, or <span className="text-[#006C4C] underline">browse files</span>
                </p>
                <p className="text-xs text-[#5E6266] mt-1">
                  Supports JPEG, PNG, WEBP meal snapshots (up to 20MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Live Camera Viewfinder */}
        {activeTab === 'camera' && (
          <div className="bg-[#1A1C1E] rounded-xl p-4 border border-[#E1E3E1] flex flex-col items-center">
            {isCameraActive ? (
              <div className="relative rounded-lg overflow-hidden max-w-md w-full bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-[#00FF9C]/60 rounded-lg pointer-events-none" />
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="px-4 py-2 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Snap Meal
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <button
                  onClick={startCamera}
                  className="px-4 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Launch Camera Viewfinder
                </button>
              </div>
            )}
          </div>
        )}

        {/* Image Preview & Scan Trigger Controls */}
        {imagePreview && (
          <div className="bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] p-4 sm:p-5 flex flex-col lg:flex-row items-center gap-5">
            
            {/* Thumbnail Preview */}
            <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden bg-white border border-[#E1E3E1] flex-shrink-0 relative group shadow-sm">
              <img
                src={imagePreview}
                alt="Meal to analyze"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-[#006C4C] animate-spin" />
                  <span className="text-[10px] text-[#006C4C] font-mono font-bold animate-pulse">
                    Scanning Food...
                  </span>
                </div>
              )}
            </div>

            {/* Target Slot Hint & User Notes */}
            <div className="flex-1 space-y-3 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5E6266] uppercase tracking-wider block mb-1">
                    Target Protocol Slot:
                  </label>
                  <select
                    value={selectedSlotHint}
                    onChange={(e) => setSelectedSlotHint(e.target.value)}
                    className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] font-medium focus:outline-none focus:border-[#006C4C]"
                  >
                    <option value="auto">Auto-detect Closest Protocol Slot (AI)</option>
                    {PROTOCOL_MEAL_SLOTS.map((s) => (
                      <option key={s.id} value={s.name}>
                        Slot {s.slotNumber}: {s.name} ({s.calories} kcal)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5E6266] uppercase tracking-wider block mb-1">
                    Optional Prep Notes (Olive oil, brands, etc.):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5% lean mince, cooked in 1 tsp olive oil"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] placeholder-[#8E918F] focus:outline-none focus:border-[#006C4C]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={runVisionAnalysis}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Ingredients &amp; Portions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Scan Image with Nutrition Vision API
                    </>
                  )}
                </button>
                <span className="text-[11px] text-[#5E6266] hidden sm:inline">
                  Uses Gemini Vision API to estimate weights &amp; calculate exact slot variance
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Error Alert */}
        {analysisError && (
          <div className="p-3.5 rounded-xl bg-[#FCE8E6] border border-[#E46962]/40 text-[#C5221F] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#E46962] flex-shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Results Workspace */}
        {analysisResult && (
          <div className="space-y-5 pt-2 border-t border-[#E1E3E1]">
            
            {/* View Mode Toggle: Interactive Review vs Raw JSON Schema */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F8F9FA] p-3 rounded-xl border border-[#E1E3E1]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5E6266]">Analysis Results:</span>
                <span className="text-sm font-bold text-[#1A1C1E]">{analysisResult.meal_name}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                <div className="flex items-center bg-white p-1 rounded-lg border border-[#E1E3E1]">
                  <button
                    onClick={() => setActiveViewMode('cards')}
                    className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                      activeViewMode === 'cards'
                        ? 'bg-[#006C4C] text-white shadow-sm'
                        : 'text-[#5E6266] hover:text-[#1A1C1E]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Interactive Review
                  </button>
                  <button
                    onClick={() => setActiveViewMode('json')}
                    className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                      activeViewMode === 'json'
                        ? 'bg-[#006C4C] text-white shadow-sm'
                        : 'text-[#5E6266] hover:text-[#1A1C1E]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Raw JSON Schema
                  </button>
                </div>

                {activeViewMode === 'json' && (
                  <button
                    onClick={copyJsonToClipboard}
                    className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#F8F9FA] text-[#1A1C1E] border border-[#E1E3E1] rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-[#006C4C]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedJson ? 'Copied!' : 'Copy JSON'}
                  </button>
                )}
              </div>
            </div>

            {/* View Mode 1: Interactive Review & Portion Weight Editor */}
            {activeViewMode === 'cards' ? (
              <div className="space-y-5">
                
                {/* Matched Slot Banner & Macro Totals */}
                <div className="bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-[#E1E3E1] gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold text-[#5E6266]">Matched Protocol Slot:</span>
                        <select
                          value={analysisResult.matched_slot}
                          onChange={(e) => handleMatchedSlotChange(e.target.value)}
                          className="bg-white border border-[#E1E3E1] text-[#006C4C] font-bold text-xs sm:text-sm rounded-lg px-2.5 py-1 focus:outline-none"
                        >
                          {PROTOCOL_MEAL_SLOTS.map((s) => (
                            <option key={s.id} value={s.name}>
                              Slot {s.slotNumber}: {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-[#5E6266] mt-1">
                        Slot Baseline Target: {matchedSlotInfo.calories} kcal • {matchedSlotInfo.protein_g}g P • {matchedSlotInfo.carbs_g}g C • {matchedSlotInfo.fat_g}g F
                      </p>
                    </div>

                    {/* Meal Totals Summary */}
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E1E3E1] text-center shadow-sm">
                        <span className="text-[9px] text-[#5E6266] block uppercase font-bold">Meal Calories</span>
                        <span className="text-base font-black text-[#006C4C]">
                          {analysisResult.meal_totals.calories} <span className="text-xs font-normal text-[#8E918F]">kcal</span>
                        </span>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E1E3E1] text-center shadow-sm">
                        <span className="text-[9px] text-[#006C4C] block uppercase font-bold">Protein</span>
                        <span className="text-base font-black text-[#1A1C1E]">{analysisResult.meal_totals.protein_g}g</span>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E1E3E1] text-center shadow-sm">
                        <span className="text-[9px] text-[#006A6A] block uppercase font-bold">Carbs</span>
                        <span className="text-base font-black text-[#1A1C1E]">{analysisResult.meal_totals.carbs_g}g</span>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E1E3E1] text-center shadow-sm">
                        <span className="text-[9px] text-[#5D4037] block uppercase font-bold">Fats</span>
                        <span className="text-base font-black text-[#1A1C1E]">{analysisResult.meal_totals.fat_g}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Slot Variance Callout */}
                  <div className="mt-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-2.5 rounded-lg border border-[#E1E3E1] font-mono text-xs shadow-sm">
                      <span className="text-[9px] text-[#5E6266] block uppercase font-bold">Calorie Variance</span>
                      <span
                        className={`text-sm font-bold ${
                          analysisResult.slot_variance.calorie_difference === 0
                            ? 'text-[#006C4C]'
                            : analysisResult.slot_variance.calorie_difference > 0
                            ? 'text-[#E46962]'
                            : 'text-[#006A6A]'
                        }`}
                      >
                        {analysisResult.slot_variance.calorie_difference > 0 ? '+' : ''}
                        {analysisResult.slot_variance.calorie_difference} kcal
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-[#E1E3E1] font-mono text-xs shadow-sm">
                      <span className="text-[9px] text-[#006C4C] block uppercase font-bold">Protein Variance</span>
                      <span
                        className={`text-sm font-bold ${
                          analysisResult.slot_variance.protein_difference_g >= 0 ? 'text-[#006C4C]' : 'text-[#E46962]'
                        }`}
                      >
                        {analysisResult.slot_variance.protein_difference_g > 0 ? '+' : ''}
                        {analysisResult.slot_variance.protein_difference_g}g
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-[#E1E3E1] font-mono text-xs shadow-sm">
                      <span className="text-[9px] text-[#006A6A] block uppercase font-bold">Carbs Variance</span>
                      <span
                        className={`text-sm font-bold ${
                          analysisResult.slot_variance.carbs_difference_g === 0
                            ? 'text-[#006C4C]'
                            : analysisResult.slot_variance.carbs_difference_g > 0
                            ? 'text-[#E46962]'
                            : 'text-[#006A6A]'
                        }`}
                      >
                        {analysisResult.slot_variance.carbs_difference_g > 0 ? '+' : ''}
                        {analysisResult.slot_variance.carbs_difference_g}g
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-[#E1E3E1] font-mono text-xs shadow-sm">
                      <span className="text-[9px] text-[#5D4037] block uppercase font-bold">Fat Variance</span>
                      <span
                        className={`text-sm font-bold ${
                          analysisResult.slot_variance.fat_difference_g === 0
                            ? 'text-[#006C4C]'
                            : analysisResult.slot_variance.fat_difference_g > 0
                            ? 'text-[#E46962]'
                            : 'text-[#006C4C]'
                        }`}
                      >
                        {analysisResult.slot_variance.fat_difference_g > 0 ? '+' : ''}
                        {analysisResult.slot_variance.fat_difference_g}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editable Ingredients Breakdown Table */}
                <div className="bg-white rounded-xl border border-[#E1E3E1] p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1C1E] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#006C4C]" />
                        Identified Ingredients &amp; Estimated Portion Weights
                      </h3>
                      <p className="text-xs text-[#5E6266]">
                        Adjust weights to recalculate macros and variance automatically
                      </p>
                    </div>
                    <button
                      onClick={handleAddIngredient}
                      className="px-2.5 py-1 text-xs font-bold bg-[#F1F3F4] hover:bg-[#E1E3E1] text-[#1A1C1E] border border-[#E1E3E1] rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E1E3E1] bg-[#F8F9FA] text-[#5E6266] uppercase font-mono text-[10px]">
                          <th className="py-2.5 pl-3">Ingredient Item</th>
                          <th className="py-2.5">Serving (g/ml)</th>
                          <th className="py-2.5">Calories</th>
                          <th className="py-2.5 text-[#006C4C]">Protein (g)</th>
                          <th className="py-2.5 text-[#006A6A]">Carbs (g)</th>
                          <th className="py-2.5 text-[#5D4037]">Fat (g)</th>
                          <th className="py-2.5 pr-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E3E1]">
                        {analysisResult.ingredients.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-[#F8F9FA]">
                            <td className="py-2.5 pl-3">
                              <input
                                type="text"
                                value={ing.name}
                                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                className="w-full bg-white font-medium text-[#1A1C1E] px-2 py-1 rounded border border-[#E1E3E1] focus:border-[#006C4C]"
                              />
                            </td>
                            <td className="py-2.5">
                              <div className="flex items-center gap-1 font-mono">
                                <input
                                  type="number"
                                  value={ing.estimated_weight_g}
                                  onChange={(e) =>
                                    handleIngredientChange(idx, 'estimated_weight_g', Number(e.target.value))
                                  }
                                  className="w-16 bg-white border border-[#E1E3E1] px-2 py-1 rounded text-[#1A1C1E] font-bold focus:border-[#006C4C]"
                                />
                                <span className="text-[#8E918F] text-[10px]">g</span>
                              </div>
                            </td>
                            <td className="py-2.5 font-mono text-[#1A1C1E]">
                              <input
                                type="number"
                                value={ing.calories}
                                onChange={(e) => handleIngredientChange(idx, 'calories', Number(e.target.value))}
                                className="w-14 bg-white border border-[#E1E3E1] px-1.5 py-1 rounded text-[#1A1C1E]"
                              />
                            </td>
                            <td className="py-2.5 font-mono text-[#006C4C]">
                              <input
                                type="number"
                                step="0.5"
                                value={ing.protein_g}
                                onChange={(e) => handleIngredientChange(idx, 'protein_g', Number(e.target.value))}
                                className="w-12 bg-white border border-[#E1E3E1] px-1.5 py-1 rounded text-[#006C4C] font-semibold"
                              />
                            </td>
                            <td className="py-2.5 font-mono text-[#006A6A]">
                              <input
                                type="number"
                                step="0.5"
                                value={ing.carbs_g}
                                onChange={(e) => handleIngredientChange(idx, 'carbs_g', Number(e.target.value))}
                                className="w-12 bg-white border border-[#E1E3E1] px-1.5 py-1 rounded text-[#006A6A] font-semibold"
                              />
                            </td>
                            <td className="py-2.5 font-mono text-[#5D4037]">
                              <input
                                type="number"
                                step="0.5"
                                value={ing.fat_g}
                                onChange={(e) => handleIngredientChange(idx, 'fat_g', Number(e.target.value))}
                                className="w-12 bg-white border border-[#E1E3E1] px-1.5 py-1 rounded text-[#5D4037] font-semibold"
                              />
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              <button
                                onClick={() => handleDeleteIngredient(idx)}
                                className="p-1.5 rounded text-[#8E918F] hover:text-[#E46962] hover:bg-[#FCE8E6] transition-colors"
                                title="Remove ingredient"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              /* View Mode 2: Exact Raw JSON Schema Output */
              <div className="bg-[#1A1C1E] rounded-xl border border-[#E1E3E1] p-4 font-mono text-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-slate-400 text-[11px]">
                  <span>Exact Raw JSON Output (Expected Schema format)</span>
                  <span className="text-[#00FF9C] font-semibold">Valid Schema</span>
                </div>
                <pre className="text-[#A8C7FA] max-h-96 overflow-y-auto p-2 bg-slate-900/90 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {rawJsonOutput}
                </pre>
              </div>
            )}

            {/* Final Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E1E3E1]">
              <div className="text-xs text-[#5E6266] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#006C4C]" />
                <span>Ready to log into Shift Day {shiftDay} Schedule</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveToSchedule}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Log to {analysisResult.matched_slot}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
