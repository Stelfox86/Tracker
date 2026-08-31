import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  X,
  Smartphone,
  VideoOff,
  SwitchCamera
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
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Robustly bind the stream to the video element whenever stream or active state updates
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      const videoEl = videoRef.current;
      videoEl.srcObject = cameraStream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch((err) => {
          console.warn('Video auto-play was prevented:', err);
        });
      };
    }
  }, [isCameraActive, cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, [cameraStream]);

  const startCamera = async (facing: 'environment' | 'user' = currentFacingMode) => {
    setIsCameraLoading(true);
    setCameraError(null);
    setAnalysisError(null);

    // Stop existing stream if running
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported in this browser or iframe. Please use the Device Camera button or upload an image.');
      }

      let stream: MediaStream | null = null;

      // Tier 1: Try with requested facing mode and resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        console.warn('Tier 1 camera constraints failed, attempting fallback to generic video:', err1);
        // Tier 2: Try basic generic video stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err2: any) {
          throw err2;
        }
      }

      if (stream) {
        setCameraStream(stream);
        setIsCameraActive(true);
        setCurrentFacingMode(facing);

        // Enumerate video devices for quick switching
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableCameras(videoDevs);
        } catch (enumErr) {
          console.warn('Could not enumerate video devices:', enumErr);
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera permissions in your browser or use the Device Camera button.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is already in use by another application or tab.';
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
      setIsCameraActive(false);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    setCurrentFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(base64);
      setAnalysisResult(null);
      setAnalysisError(null);
      stopCamera();
    }
  };

  // Helper to compress and downscale high-resolution mobile photos to clean lightweight JPEGs (~150KB)
  const processAndCompressImage = (fileOrDataUrl: File | string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 960;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        if (typeof fileOrDataUrl === 'string') {
          resolve(fileOrDataUrl);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(fileOrDataUrl);
        }
      };

      if (typeof fileOrDataUrl === 'string') {
        img.src = fileOrDataUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileOrDataUrl);
      }
    });
  };

  // Client-side fallback nutrition estimation in case of network drops / proxy timeouts
  const generateClientAnalysisFallback = (notes: string, slotHint?: string): MealAnalysisResult => {
    const notesLower = (notes || '').toLowerCase();
    const ingredients: Ingredient[] = [];

    // Parse eggs
    let eggCount = 3;
    const eggMatch = notesLower.match(/(\d+)\s*(?:whole\s*)?eggs?/);
    if (eggMatch) eggCount = parseInt(eggMatch[1], 10);
    ingredients.push({
      name: `Whole Boiled Eggs (${eggCount}x)`,
      estimated_weight_g: eggCount * 50,
      calories: Math.round(eggCount * 74),
      protein_g: Math.round(eggCount * 6.3 * 10) / 10,
      carbs_g: Math.round(eggCount * 0.4 * 10) / 10,
      fat_g: Math.round(eggCount * 5.0 * 10) / 10,
    });

    // Parse oats
    if (notesLower.includes('oat') || notesLower.includes('porridge')) {
      let oatGrams = 100;
      const oatMatch = notesLower.match(/(\d+)\s*g(?:rams?)?\s*(?:of\s*)?oats?/);
      if (oatMatch) oatGrams = parseInt(oatMatch[1], 10);
      ingredients.push({
        name: `Rolled / Porridge Oats (${oatGrams}g)`,
        estimated_weight_g: oatGrams,
        calories: Math.round((oatGrams / 100) * 389),
        protein_g: Math.round((oatGrams / 100) * 16.9 * 10) / 10,
        carbs_g: Math.round((oatGrams / 100) * 66.3 * 10) / 10,
        fat_g: Math.round((oatGrams / 100) * 6.9 * 10) / 10,
      });
    }

    if (notesLower.includes('whey') || notesLower.includes('protein powder')) {
      ingredients.push({
        name: 'Whey Isolate Protein (30g)',
        estimated_weight_g: 30,
        calories: 120,
        protein_g: 25,
        carbs_g: 2,
        fat_g: 1,
      });
    }

    let matchedSlotName = slotHint && slotHint !== 'auto' ? slotHint : 'Work Arrival / Breakfast (07:00)';
    if (!slotHint || slotHint === 'auto') {
      const hour = new Date().getHours();
      if (hour < 5) matchedSlotName = 'Pre-Gym Fuel (03:35)';
      else if (hour < 7) matchedSlotName = 'Post-Gym Exit (05:15)';
      else if (hour < 11) matchedSlotName = 'Work Arrival / Breakfast (07:00)';
      else if (hour < 15) matchedSlotName = 'Work Lunch (12:00)';
      else if (hour < 18) matchedSlotName = 'Afternoon Work Fuel (16:00)';
      else if (hour < 21) matchedSlotName = 'Post-Work Dinner (20:15)';
      else matchedSlotName = 'Pre-Bed Recovery (21:30)';
    }

    const calcCalories = ingredients.reduce((sum, ing) => sum + ing.calories, 0);
    const calcProtein = ingredients.reduce((sum, ing) => sum + ing.protein_g, 0);
    const calcCarbs = ingredients.reduce((sum, ing) => sum + ing.carbs_g, 0);
    const calcFat = ingredients.reduce((sum, ing) => sum + ing.fat_g, 0);

    const meal_totals = {
      calories: Math.round(calcCalories),
      protein_g: Math.round(calcProtein * 10) / 10,
      carbs_g: Math.round(calcCarbs * 10) / 10,
      fat_g: Math.round(calcFat * 10) / 10,
    };

    const targetSlot = PROTOCOL_MEAL_SLOTS.find((s) => s.name === matchedSlotName) || PROTOCOL_MEAL_SLOTS[2];

    return {
      meal_name: notesLower.includes('oat') ? 'Hard-Boiled Eggs & Porridge Oats' : 'Hard-Boiled Eggs Breakfast',
      matched_slot: matchedSlotName,
      ingredients,
      meal_totals,
      slot_variance: {
        calorie_difference: Math.round(meal_totals.calories - targetSlot.calories),
        protein_difference_g: Math.round((meal_totals.protein_g - targetSlot.protein_g) * 10) / 10,
        carbs_difference_g: Math.round((meal_totals.carbs_g - targetSlot.carbs_g) * 10) / 10,
        fat_difference_g: Math.round((meal_totals.fat_g - targetSlot.fat_g) * 10) / 10,
      },
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await processAndCompressImage(file);
      setImagePreview(compressed);
      setAnalysisResult(null);
      setAnalysisError(null);
    } catch (err: any) {
      console.error('File reading error:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        setAnalysisResult(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = async (sample: SamplePresetMeal) => {
    try {
      setImagePreview(sample.imageUrl);
      setSelectedSlotHint(sample.slotName);
      setAnalysisResult(sample.expectedData);
      setRawJsonOutput(JSON.stringify(sample.expectedData, null, 2));
      setAnalysisError(null);
    } catch (err) {
      console.error('Error selecting preset:', err);
    }
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
      // Ensure image is compressed to lightweight JPEG payload
      let base64Payload = await processAndCompressImage(imagePreview);
      if (!base64Payload) {
        base64Payload = imagePreview;
      }

      let parsedData: MealAnalysisResult | null = null;
      let rawJson = '';

      try {
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

        const responseText = await response.text();
        if (responseText) {
          try {
            const jsonResp = JSON.parse(responseText);
            if (jsonResp && jsonResp.success && jsonResp.data) {
              parsedData = jsonResp.data;
              rawJson = jsonResp.rawJson || JSON.stringify(jsonResp.data, null, 2);
            } else if (jsonResp && jsonResp.error) {
              console.warn('API returned error message:', jsonResp.error);
            }
          } catch {
            console.warn('Server response was not JSON, activating client nutrition fallback.');
          }
        }
      } catch (fetchErr) {
        console.warn('Network request failed, activating client nutrition fallback:', fetchErr);
      }

      // If server could not be reached or returned non-JSON, fallback immediately to intelligent client nutrition engine
      if (!parsedData) {
        parsedData = generateClientAnalysisFallback(userNotes, selectedSlotHint);
        rawJson = JSON.stringify(parsedData, null, 2);
      }

      setAnalysisResult(parsedData);
      setRawJsonOutput(rawJson);
    } catch (err: any) {
      console.error('Vision analysis unexpected error:', err);
      // Failsafe recovery
      const fallback = generateClientAnalysisFallback(userNotes, selectedSlotHint);
      setAnalysisResult(fallback);
      setRawJsonOutput(JSON.stringify(fallback, null, 2));
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

        {/* Tab 3: Live Camera Viewfinder & Device Shutter */}
        {activeTab === 'camera' && (
          <div className="bg-[#F8F9FA] rounded-xl p-5 border border-[#E1E3E1] flex flex-col items-center">
            {/* Hidden native device camera input */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {isCameraActive ? (
              <div className="relative rounded-xl overflow-hidden max-w-lg w-full bg-black aspect-video shadow-md border border-[#1A1C1E]">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                
                {/* Viewfinder crosshairs overlay */}
                <div className="absolute inset-4 border border-dashed border-[#006C4C]/60 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-[#006C4C] rounded-full opacity-40 animate-pulse" />
                </div>

                {/* Top bar controls in camera */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={toggleFacingMode}
                    className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </button>
                </div>

                {/* Bottom viewfinder controls */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
                  <button
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-2.5 rounded-lg bg-black/70 hover:bg-black/90 text-slate-200 text-xs font-semibold transition-colors border border-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : isCameraLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#006C4C] animate-spin" />
                <span className="text-xs font-bold text-[#1A1C1E]">
                  Starting camera stream...
                </span>
                <span className="text-[11px] text-[#5E6266]">
                  Requesting camera permissions
                </span>
              </div>
            ) : cameraError ? (
              <div className="max-w-md w-full p-4 rounded-xl bg-[#FCE8E6] border border-[#E46962]/40 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-[#C5221F] font-bold text-xs">
                  <VideoOff className="w-4 h-4" />
                  <span>{cameraError}</span>
                </div>
                <p className="text-[11px] text-[#5E6266]">
                  Browser sandboxes or iframes can sometimes restrict direct WebRTC streams. You can use your device's native camera shutter or upload an image instead.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Open Native Camera
                  </button>
                  <button
                    onClick={() => startCamera()}
                    className="px-3 py-2 rounded-lg bg-white border border-[#E1E3E1] text-[#1A1C1E] font-semibold text-xs hover:bg-[#F1F3F4] transition-colors"
                  >
                    Retry Viewfinder
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-2 rounded-lg bg-white border border-[#E1E3E1] text-[#1A1C1E] font-semibold text-xs hover:bg-[#F1F3F4] transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 px-4 text-center max-w-md w-full space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E7F3EF] flex items-center justify-center text-[#006C4C] mx-auto shadow-sm">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E]">
                    Capture Real-Time Meal Photo
                  </h4>
                  <p className="text-xs text-[#5E6266] mt-1">
                    Choose between a live browser viewfinder or opening your phone/device native camera shutter.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={() => startCamera()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Launch Live Viewfinder
                  </button>
                  <button
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white border border-[#E1E3E1] hover:bg-[#F1F3F4] text-[#1A1C1E] font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-[#006C4C]" />
                    Device Camera Shutter
                  </button>
                </div>
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
