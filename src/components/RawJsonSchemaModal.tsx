import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, Sparkles } from 'lucide-react';

interface RawJsonSchemaModalProps {
  onClose: () => void;
}

export const RawJsonSchemaModal: React.FC<RawJsonSchemaModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const sampleSchema = `{
  "meal_name": "string",
  "matched_slot": "string",
  "ingredients": [
    {
      "name": "string",
      "estimated_weight_g": 0,
      "calories": 0,
      "protein_g": 0,
      "carbs_g": 0,
      "fat_g": 0
    }
  ],
  "meal_totals": {
    "calories": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0
  },
  "slot_variance": {
    "calorie_difference": 0,
    "protein_difference_g": 0,
    "carbs_difference_g": 0,
    "fat_difference_g": 0
  }
}`;

  const sampleCurl = `curl -X POST http://localhost:3000/api/analyze-meal \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "slotHint": "Work Lunch (12:00)"
  }'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E1E3E1] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[#1A1C1E]">
        
        <div className="p-5 border-b border-[#E1E3E1] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center border border-[#006C4C]/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1C1E]">
                Vision API JSON Schema &amp; Specifications
              </h2>
              <p className="text-xs text-[#5E6266]">
                Strict format output for 4-Day Shift &amp; Early Lift Protocol
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#F1F3F4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#5E6266] uppercase tracking-wider">
                Expected Output JSON Schema:
              </span>
              <button
                onClick={() => copyToClipboard(sampleSchema)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#F8F9FA] text-[#1A1C1E] rounded-lg flex items-center gap-1 border border-[#E1E3E1] shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#006C4C]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Schema'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#1A1C1E] border border-[#E1E3E1] text-[#00FF9C] font-mono text-xs overflow-x-auto">
              {sampleSchema}
            </pre>
          </div>

          <div>
            <span className="text-xs font-bold text-[#5E6266] uppercase tracking-wider block mb-2">
              cURL API Request Example:
            </span>
            <pre className="p-4 rounded-xl bg-[#1A1C1E] border border-[#E1E3E1] text-[#A8C7FA] font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {sampleCurl}
            </pre>
          </div>

          <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E1E3E1] text-xs text-[#1A1C1E] space-y-2">
            <h4 className="font-bold text-[#1A1C1E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#006C4C]" /> Schema Field Definitions:
            </h4>
            <ul className="space-y-1.5 text-[#5E6266] text-[11px] font-mono">
              <li><strong className="text-[#1A1C1E]">meal_name:</strong> Descriptive food title recognized by the vision model.</li>
              <li><strong className="text-[#1A1C1E]">matched_slot:</strong> Exact matching name from the 7 target slots.</li>
              <li><strong className="text-[#1A1C1E]">ingredients[]:</strong> Array of identified items with serving weights in grams (g) or ml, calories, and macros.</li>
              <li><strong className="text-[#1A1C1E]">meal_totals:</strong> Cumulative calories, protein, carbs, fat of the analyzed meal.</li>
              <li><strong className="text-[#1A1C1E]">slot_variance:</strong> Exact difference calculated as (meal_totals minus target slot baseline).</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
