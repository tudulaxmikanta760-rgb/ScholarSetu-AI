import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  CircleAlert,
  Download,
  ExternalLink,
  FileCheck2,
  Globe,
  HelpCircle,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import type {
  EligibilityQAItem,
  LiveVerificationResult,
  ScholarshipOpportunity,
  StudentProfile,
} from '../types';

interface OpportunityDetailProps {
  opportunity: ScholarshipOpportunity;
  profile: StudentProfile;
  isSaved: boolean;
  onToggleSave: (opportunity: ScholarshipOpportunity) => void;
  checkedDocs: Record<string, boolean>;
  onToggleDoc: (docId: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Can I apply for this alongside my State Post-Matric scholarship?',
  'What is the exact Aadhaar NPCI bank seeding requirement here?',
  'How recent must my Income Certificate be for this portal?',
];

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({
  opportunity,
  profile,
  isSaved,
  onToggleSave,
  checkedDocs,
  onToggleDoc,
}) => {
  const [liveData, setLiveData] = useState<LiveVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [qaList, setQaList] = useState<EligibilityQAItem[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Reset scheme-specific live verification & Q&A when switching selected opportunity
  useEffect(() => {
    setLiveData(null);
    setVerifyError(null);
    setQaList([]);
    setQuestionInput('');
    setAskError(null);
  }, [opportunity.id]);

  const docsReadyCount = opportunity.documents.filter((d) => checkedDocs[d.id]).length;
  const docsTotalCount = opportunity.documents.length;
  const docsPercent =
    docsTotalCount > 0 ? Math.round((docsReadyCount / docsTotalCount) * 100) : 0;

  const handleVerifyLive = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch('/api/scholarships/verify-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeName: opportunity.name,
          provider: opportunity.provider,
          state: profile.state,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not verify live portal notices.');
      }
      setLiveData(data);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Live verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAskQuestion = async (qText?: string) => {
    const query = (qText ?? questionInput).trim();
    if (!query || isAsking) return;

    setIsAsking(true);
    setAskError(null);
    try {
      const res = await fetch('/api/scholarships/ask-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          scheme: {
            name: opportunity.name,
            provider: opportunity.provider,
            officialPortalName: opportunity.officialPortalName,
            officialPortalUrl: opportunity.officialPortalUrl,
            benefitAmount: opportunity.benefitAmount,
          },
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to answer eligibility question right now.');
      }
      setQaList((prev) => [...prev, { question: query, answer: data.answer }]);
      if (!qText) setQuestionInput('');
    } catch (err) {
      setAskError(err instanceof Error ? err.message : 'Question could not be processed.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleDownloadSchemeChecklist = () => {
    const lines = [
      `SCHOLARSETU AI — DOCUMENT & APPLICATION CHECKLIST`,
      `=================================================`,
      `Scheme: ${opportunity.name}`,
      `Sponsoring Body: ${opportunity.provider}`,
      `Official Portal: ${opportunity.officialPortalName} (${opportunity.officialPortalUrl})`,
      `Estimated Benefit: ${opportunity.benefitAmount}`,
      `Application Cycle: ${opportunity.applicationWindow}`,
      ``,
      `REQUIRED DOCUMENTS (${docsReadyCount}/${docsTotalCount} Ready)`,
      `-------------------------------------------------`,
      ...opportunity.documents.map((d, idx) => {
        const mark = checkedDocs[d.id] ? '[x]' : '[ ]';
        return `${idx + 1}. ${mark} ${d.name} (${d.mandatory ? 'Mandatory' : 'Conditional'})\n    Authority: ${d.issuingAuthority}\n    Format: ${d.formatNote}\n    Tip: ${d.tip}`;
      }),
      ``,
      `APPLICATION STEPS`,
      `-------------------------------------------------`,
      ...opportunity.stepByStepProcess.map((s, idx) => `${idx + 1}. ${s}`),
      ``,
      `COMMON REJECTION PITFALLS TO AVOID`,
      `-------------------------------------------------`,
      ...opportunity.commonPitfalls.map((p) => `- ${p}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${opportunity.id || 'scholarship'}-checklist.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const verdictColor =
    opportunity.eligibilityVerdict === 'Strong Match'
      ? 'text-emerald-700'
      : opportunity.eligibilityVerdict === 'Likely Eligible'
      ? 'text-blue-800'
      : 'text-amber-700';

  const VerdictIcon =
    opportunity.eligibilityVerdict === 'Strong Match'
      ? CheckCircle2
      : opportunity.eligibilityVerdict === 'Likely Eligible'
      ? ShieldCheck
      : CircleAlert;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header Summary */}
      <div className="p-6 sm:p-7 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-800">{opportunity.scope}</span>
          <span aria-hidden="true">·</span>
          <span>{opportunity.provider}</span>
          <span aria-hidden="true">·</span>
          <span>{opportunity.opportunityType}</span>
          <span aria-hidden="true">·</span>
          <span className={`inline-flex items-center gap-1 font-semibold ${verdictColor}`}>
            <VerdictIcon className="w-3.5 h-3.5" />
            {opportunity.eligibilityVerdict}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-900 leading-tight">
          {opportunity.name}
        </h2>

        <p className="text-sm text-slate-700 mt-3 leading-relaxed">
          {opportunity.whyItFits}
        </p>

        {/* Key metrics hairline strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="block text-xs text-slate-500">Financial Benefit</span>
            <span className="block mt-0.5 font-mono text-sm font-medium text-slate-900 tabular-nums">
              {opportunity.benefitAmount}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Typical Application Window</span>
            <span className="block mt-0.5 text-sm font-medium text-slate-900">
              {opportunity.applicationWindow}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Official Portal</span>
            <a
              href={opportunity.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"
            >
              <span className="truncate">{opportunity.officialPortalName}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={opportunity.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Open Official Portal
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleVerifyLive}
            disabled={isVerifying}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-800" />
            ) : (
              <Globe className="w-4 h-4 text-blue-800" />
            )}
            {isVerifying ? 'Checking Live Notices...' : 'Verify Live Dates'}
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(opportunity)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isSaved
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save Scheme'}
          </button>

          <button
            type="button"
            onClick={handleDownloadSchemeChecklist}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Checklist
          </button>
        </div>

        {/* Live Google Search Grounding Result */}
        {verifyError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            {verifyError}
          </div>
        )}

        {liveData && (
          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-900">
                Live Web Verification Brief
              </span>
              <span className="font-mono text-slate-500 tabular-nums">
                Checked {liveData.verifiedAt}
              </span>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {liveData.summary}
            </div>
            {liveData.sources.length > 0 && (
              <div className="pt-2.5 border-t border-slate-200">
                <span className="block text-xs font-medium text-slate-500 mb-1.5">
                  Referenced Web Sources:
                </span>
                <ul className="space-y-1">
                  {liveData.sources.map((src) => (
                    <li key={src.uri}>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-800 hover:underline break-all"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{src.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 1: Transparent Eligibility Breakdown Table */}
      <div className="p-6 sm:p-7 border-b border-slate-200">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              01. Eligibility Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side comparison of scheme rules against your submitted profile.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-3.5">Criterion</th>
                <th className="py-2.5 px-3.5">Scheme Requirement</th>
                <th className="py-2.5 px-3.5">Your Profile</th>
                <th className="py-2.5 px-3.5 text-right">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {opportunity.eligibilityBreakdown.map((row, idx) => {
                const statusColor =
                  row.verdict === 'Met'
                    ? 'text-emerald-700'
                    : row.verdict === 'Verify'
                    ? 'text-amber-700'
                    : 'text-red-700';
                const Icon =
                  row.verdict === 'Met'
                    ? CheckCircle2
                    : row.verdict === 'Verify'
                    ? CircleAlert
                    : AlertTriangle;

                return (
                  <tr key={`${row.criterion}-${idx}`} className="align-top">
                    <td className="py-3 px-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {row.criterion}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">{row.requirement}</td>
                    <td className="py-3 px-3.5 text-slate-800">{row.studentStatus}</td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-end gap-1 text-xs font-semibold ${statusColor}`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {row.verdict}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Interactive Document Checklist */}
      <div className="p-6 sm:p-7 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              02. Required Document Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tick documents you already hold—progress syncs automatically with your Master Document Vault.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-700 tabular-nums shrink-0">
            <FileCheck2 className="w-4 h-4 text-blue-800" />
            <span>
              {docsReadyCount}/{docsTotalCount} ready ({docsPercent}%)
            </span>
          </div>
        </div>

        {/* Thin progress track */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-blue-800 transition-transform duration-200 origin-left"
            style={{ transform: `scaleX(${docsPercent / 100})` }}
          />
        </div>

        <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          {opportunity.documents.map((doc) => {
            const isChecked = Boolean(checkedDocs[doc.id]);
            return (
              <li
                key={doc.id}
                className={`p-4 transition-colors ${
                  isChecked ? 'bg-slate-50/90' : 'bg-white'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDoc(doc.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span
                        className={`text-sm font-semibold ${
                          isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {doc.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        · {doc.mandatory ? 'Mandatory' : 'Conditional'}
                      </span>
                      <span className="text-xs text-slate-500">
                        · Issued by {doc.issuingAuthority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-medium text-slate-700">Format:</span> {doc.formatNote}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">Verification tip:</span> {doc.tip}
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Section 3: Application Steps & Pitfalls */}
      <div className="p-6 sm:p-7 border-b border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">
            03. Step-by-Step Application Process
          </h3>
          <ol className="space-y-3">
            {opportunity.stepByStepProcess.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                <span className="font-mono text-xs font-semibold text-blue-800 mt-0.5 tabular-nums shrink-0">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-slate-200 lg:pl-6">
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">
            Common Rejection Pitfalls
          </h3>
          <ul className="space-y-3">
            {opportunity.commonPitfalls.map((pitfall, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 4: Focused Eligibility Q&A */}
      <div className="p-6 sm:p-7 bg-slate-50/70">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-blue-800" />
          <h3 className="font-display text-lg font-semibold text-slate-900">
            04. Clarify a Specific Eligibility Rule
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Ask about renewal grades, stacking central and state schemes, certificate validity, or college verification for this exact scheme.
        </p>

        {/* Quick prompt chips (functional interactive buttons) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isAsking}
              onClick={() => handleAskQuestion(q)}
              className="px-3 py-1.5 text-xs text-left font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="e.g., Does gap year after Class 12 disqualify me from this scheme?"
            className="flex-1 h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
          />
          <button
            type="submit"
            disabled={isAsking || !questionInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isAsking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Ask Advisor
          </button>
        </form>

        {askError && (
          <p className="mt-3 text-xs text-red-700">{askError}</p>
        )}

        {qaList.length > 0 && (
          <div className="mt-4 space-y-3">
            {qaList.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5"
              >
                <p className="text-xs font-semibold text-slate-900">
                  Q: {item.question}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
