import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  Printer,
  RotateCcw,
} from 'lucide-react';
import type { MasterDocument, StudentProfile } from '../types';

interface DocumentVaultProps {
  documents: MasterDocument[];
  checkedDocs: Record<string, boolean>;
  onToggleDoc: (docId: string) => void;
  onClearChecked: () => void;
  profile: StudentProfile;
  onGoToFinder: () => void;
}

type VaultFilter = 'All' | 'Pending' | 'Ready';

const DESK_IMAGE_URL = '/src/assets/images/portal_documents_desk_1795101328697.jpg';

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  checkedDocs,
  onToggleDoc,
  onClearChecked,
  profile,
  onGoToFinder,
}) => {
  const [filter, setFilter] = useState<VaultFilter>('All');
  const [imgFailed, setImgFailed] = useState(false);

  const readyCount = useMemo(
    () => documents.filter((d) => checkedDocs[d.id]).length,
    [documents, checkedDocs]
  );

  const totalCount = documents.length;
  const percent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const ready = Boolean(checkedDocs[d.id]);
      if (filter === 'Ready') return ready;
      if (filter === 'Pending') return !ready;
      return true;
    });
  }, [documents, checkedDocs, filter]);

  const groupedByPriority = useMemo(() => {
    const groups: Record<MasterDocument['priority'], MasterDocument[]> = {
      'Core Foundation': [],
      'Category & Income': [],
      'Academic & Institution': [],
    };
    for (const doc of filteredDocs) {
      if (groups[doc.priority]) {
        groups[doc.priority].push(doc);
      } else {
        groups['Core Foundation'].push(doc);
      }
    }
    return groups;
  }, [filteredDocs]);

  const handleExportMaster = () => {
    const lines = [
      `SCHOLARSETU AI — MASTER STUDENT DOCUMENT CHECKLIST`,
      `==================================================`,
      `Profile: ${profile.educationLevel} · ${profile.stream} · ${profile.category} · ${profile.state}`,
      `Readiness: ${readyCount} of ${totalCount} documents ready (${percent}%)`,
      ``,
      ...documents.map((doc, idx) => {
        const mark = checkedDocs[doc.id] ? '[x]' : '[ ]';
        return `${idx + 1}. ${mark} ${doc.name}\n    Category: ${doc.priority}\n    Issuing Authority: ${doc.issuingAuthority}\n    Required by: ${doc.usedBySchemes.join(', ')}\n    Preparation Tip: ${doc.preparationTip}`;
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarsetu-master-checklist-${profile.state.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (documents.length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-2xl mx-auto">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h2 className="font-display text-2xl font-semibold text-slate-900">
          Your Master Document Vault is empty
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Run an eligibility match in the Finder first. ScholarSetu AI will consolidate every required certificate across all your eligible Central and State schemes into one deduplicated preparation checklist.
        </p>
        <button
          type="button"
          onClick={onGoToFinder}
          className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
        >
          Go to Scholarship Finder
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Editorial Top Summary Split */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-blue-800 mb-1.5">
              Consolidated Preparation Plan · {profile.state} · {profile.category}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Prepare once, apply across every eligible portal
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Most government scholarship rejections happen because of mismatched Aadhaar bank seeding, expired financial-year income certificates, or unverified institute bonafides. Check off each record below as you digitize it.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold text-slate-700">
                Overall Document Readiness
              </span>
              <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                {readyCount} / {totalCount} ready ({percent}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-800 transition-transform duration-200 origin-left"
                style={{ transform: `scaleX(${percent / 100})` }}
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 no-print">
              <button
                type="button"
                onClick={handleExportMaster}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                Download Checklist (.txt)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Printer className="w-4 h-4" />
                Print Checklist
              </button>
              {readyCount > 0 && (
                <button
                  type="button"
                  onClick={onClearChecked}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Checked
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 relative min-h-[220px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200">
          {!imgFailed ? (
            <img
              src={DESK_IMAGE_URL}
              alt="Neatly organized academic folders and printed document checklist on a study desk"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full lg:h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-100 to-slate-200">
              <FileText className="w-8 h-8 text-blue-800 mb-2" />
              <span className="font-display text-sm font-semibold text-slate-800">
                Student Document Readiness Folder
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div
          role="tablist"
          aria-label="Filter documents by readiness"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg"
        >
          {(['All', 'Pending', 'Ready'] as VaultFilter[]).map((tab) => {
            const active = filter === tab;
            const count =
              tab === 'All'
                ? totalCount
                : tab === 'Ready'
                ? readyCount
                : totalCount - readyCount;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
                <span className="ml-1.5 font-mono text-[11px] tabular-nums text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500">
          Tip: Keep scanned PDFs under 200 KB (150–200 DPI) for NSP and State DBT uploads.
        </p>
      </div>

      {/* Grouped Master Checklist */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">
            {filter === 'Pending'
              ? 'All required documents are marked ready.'
              : 'No documents marked ready yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(
            ['Core Foundation', 'Category & Income', 'Academic & Institution'] as const
          ).map((priority) => {
            const group = groupedByPriority[priority];
            if (group.length === 0) return null;
            return (
              <div
                key={priority}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    {priority}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {group.filter((d) => checkedDocs[d.id]).length}/{group.length} ready
                  </span>
                </div>

                <ul className="divide-y divide-slate-200">
                  {group.map((doc) => {
                    const isChecked = Boolean(checkedDocs[doc.id]);
                    return (
                      <li
                        key={doc.id}
                        className={`p-5 transition-colors ${
                          isChecked ? 'bg-slate-50/80' : 'bg-white'
                        }`}
                      >
                        <label className="flex items-start gap-3.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleDoc(doc.id)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                {doc.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                Authority: {doc.issuingAuthority}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              {doc.preparationTip}
                            </p>

                            <p className="text-xs text-slate-500 mt-2">
                              <span className="font-medium text-slate-700">Unlocks:</span>{' '}
                              {doc.usedBySchemes.join(' · ')}
                            </p>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
