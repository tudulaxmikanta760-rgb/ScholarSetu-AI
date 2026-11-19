import React from 'react';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import {
  ACADEMIC_STREAMS,
  EDUCATION_LEVELS,
  GENDER_OPTIONS,
  INCOME_BRACKETS,
  INDIAN_STATES_AND_UTS,
  OPPORTUNITY_FOCUSES,
  SOCIAL_CATEGORIES,
  SPECIAL_CRITERIA_OPTIONS,
  STUDENT_PRESETS,
} from '../data/indianPortals';
import type { StudentProfile } from '../types';

interface ProfileFormProps {
  profile: StudentProfile;
  onChange: (next: StudentProfile) => void;
  onSubmit: (profileToRun?: StudentProfile) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onChange,
  onSubmit,
  onReset,
  isLoading,
}) => {
  const toggleSpecialCriterion = (item: string) => {
    const exists = profile.specialCriteria.includes(item);
    const updated = exists
      ? profile.specialCriteria.filter((c) => c !== item)
      : [...profile.specialCriteria, item];
    onChange({ ...profile, specialCriteria: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section
      id="eligibility-form"
      aria-labelledby="profile-form-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-blue-800 mb-1.5">
            Step 01 · Student Qualification & Domicile Profile
          </p>
          <h2
            id="profile-form-heading"
            className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900"
          >
            Enter your academic and category details
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Every field maps directly to official Central and State DBT eligibility rules—including income ceilings, reservation categories, and state residency.
          </p>
        </div>

        {/* Quick realistic student examples */}
        <div className="flex flex-col items-start lg:items-end gap-2">
          <span className="text-xs text-slate-500">Try a sample student profile:</span>
          <div className="flex flex-wrap items-center gap-2">
            {STUDENT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  onChange(preset.profile);
                  onSubmit(preset.profile);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                title={preset.summary}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Education Level */}
          <div>
            <label
              htmlFor="educationLevel"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Current Education Level
            </label>
            <select
              id="educationLevel"
              value={profile.educationLevel}
              onChange={(e) =>
                onChange({
                  ...profile,
                  educationLevel: e.target.value as StudentProfile['educationLevel'],
                })
              }
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Stream */}
          <div>
            <label
              htmlFor="stream"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Stream / Discipline
            </label>
            <select
              id="stream"
              value={profile.stream}
              onChange={(e) =>
                onChange({
                  ...profile,
                  stream: e.target.value as StudentProfile['stream'],
                })
              }
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {ACADEMIC_STREAMS.map((stream) => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Percentage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="percentage"
                className="text-xs font-semibold text-slate-700"
              >
                Last Exam Score (%)
              </label>
              <span className="font-mono text-xs font-medium text-blue-800 tabular-nums">
                {profile.percentage}%
              </span>
            </div>
            <div className="flex items-center gap-3 h-11 px-3 bg-slate-50 border border-slate-300 rounded-lg">
              <input
                id="percentage"
                type="range"
                min={35}
                max={100}
                step={1}
                value={profile.percentage}
                onChange={(e) =>
                  onChange({ ...profile, percentage: Number(e.target.value) })
                }
                className="w-full accent-blue-800 cursor-pointer"
              />
              <input
                aria-label="Exact percentage"
                type="number"
                min={35}
                max={100}
                value={profile.percentage}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(35, Number(e.target.value) || 35));
                  onChange({ ...profile, percentage: val });
                }}
                className="w-14 text-right font-mono text-sm text-slate-900 bg-white border border-slate-200 rounded px-1.5 py-1 tabular-nums"
              />
            </div>
          </div>

          {/* Social Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Social / Reservation Category
            </label>
            <select
              id="category"
              value={profile.category}
              onChange={(e) =>
                onChange({
                  ...profile,
                  category: e.target.value as StudentProfile['category'],
                })
              }
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {SOCIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Annual Family Income */}
          <div>
            <label
              htmlFor="annualIncome"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Annual Family Income (INR)
            </label>
            <select
              id="annualIncome"
              value={profile.annualIncome}
              onChange={(e) =>
                onChange({
                  ...profile,
                  annualIncome: e.target.value as StudentProfile['annualIncome'],
                })
              }
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {INCOME_BRACKETS.map((bracket) => (
                <option key={bracket} value={bracket}>
                  {bracket}
                </option>
              ))}
            </select>
          </div>

          {/* State / UT */}
          <div>
            <label
              htmlFor="state"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              State / UT of Domicile
            </label>
            <select
              id="state"
              value={profile.state}
              onChange={(e) => onChange({ ...profile, state: e.target.value })}
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District (Optional) */}
          <div>
            <label
              htmlFor="district"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              District / City <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="district"
              type="text"
              placeholder="e.g., Pune, Cuttack, Varanasi"
              value={profile.district}
              onChange={(e) => onChange({ ...profile, district: e.target.value })}
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Gender
            </label>
            <select
              id="gender"
              value={profile.gender}
              onChange={(e) =>
                onChange({
                  ...profile,
                  gender: e.target.value as StudentProfile['gender'],
                })
              }
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Institution Type & Opportunity Focus */}
          <div>
            <label
              htmlFor="opportunityFocus"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Opportunity Focus
            </label>
            <select
              id="opportunityFocus"
              value={profile.opportunityFocus}
              onChange={(e) =>
                onChange({
                  ...profile,
                  opportunityFocus: e.target.value as StudentProfile['opportunityFocus'],
                })
              }
              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            >
              {OPPORTUNITY_FOCUSES.map((focus) => (
                <option key={focus} value={focus}>
                  {focus}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Institution Type segmented row */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Institution Category
            </span>
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(
                ['Government / Public', 'Government-Aided', 'Private Recognized'] as const
              ).map((inst) => {
                const active = profile.institutionType === inst;
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => onChange({ ...profile, institutionType: inst })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {inst}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Special Eligibility Factors */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-700">
              Additional Eligibility Factors{' '}
              <span className="font-normal text-slate-500">
                (Select any that apply — unlocks dedicated Central & State quotas)
              </span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SPECIAL_CRITERIA_OPTIONS.map((item) => {
              const checked = profile.specialCriteria.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs leading-snug cursor-pointer transition-colors ${
                    checked
                      ? 'bg-blue-50/70 border-blue-700 text-slate-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSpecialCriterion(item)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800 shrink-0"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Matches Central (NSP, AICTE, UGC, DST, Skill India) &amp; {profile.state} State schemes with transparent rule checks.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Matching Schemes...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Eligible Opportunities
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
