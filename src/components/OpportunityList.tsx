import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { ScholarshipOpportunity } from '../types';

interface OpportunityListProps {
  opportunities: ScholarshipOpportunity[];
  selectedId: string | null;
  onSelect: (opportunity: ScholarshipOpportunity) => void;
  savedIds: string[];
  onToggleSave: (opportunity: ScholarshipOpportunity) => void;
  checkedDocs: Record<string, boolean>;
  emptyMessage?: string;
}

type ScopeFilter = 'All' | 'Central' | 'State' | 'Fellowship' | 'Skill & Internship';

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  selectedId,
  onSelect,
  savedIds,
  onToggleSave,
  checkedDocs,
  emptyMessage = 'No opportunities match the active filter.',
}) => {
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('All');
  const [query, setQuery] = useState('');

  const scopeCounts = useMemo(() => {
    const counts: Record<ScopeFilter, number> = {
      All: opportunities.length,
      Central: 0,
      State: 0,
      Fellowship: 0,
      'Skill & Internship': 0,
    };
    for (const opp of opportunities) {
      if (opp.scope in counts) {
        counts[opp.scope] += 1;
      }
    }
    return counts;
  }, [opportunities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities.filter((opp) => {
      if (scopeFilter !== 'All' && opp.scope !== scopeFilter) return false;
      if (!q) return true;
      return (
        opp.name.toLowerCase().includes(q) ||
        opp.provider.toLowerCase().includes(q) ||
        opp.opportunityType.toLowerCase().includes(q) ||
        opp.officialPortalName.toLowerCase().includes(q)
      );
    });
  }, [opportunities, scopeFilter, query]);

  const scopes: ScopeFilter[] = ['All', 'Central', 'State', 'Fellowship', 'Skill & Internship'];

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by scheme name, ministry, or portal..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
          />
        </div>

        {/* Interactive segmented filter tabs */}
        <div
          role="tablist"
          aria-label="Filter opportunities by scope"
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto"
        >
          {scopes.map((scope) => {
            const active = scopeFilter === scope;
            const count = scopeCounts[scope];
            if (scope !== 'All' && count === 0) return null;
            return (
              <button
                key={scope}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setScopeFilter(scope)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {scope}
                <span className="ml-1.5 font-mono text-[11px] tabular-nums text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm font-medium text-slate-800">{emptyMessage}</p>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your search term or switching back to All categories.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filtered.map((opp) => {
            const isSelected = opp.id === selectedId;
            const isSaved = savedIds.includes(opp.id);
            const docsReady = opp.documents.filter((d) => checkedDocs[d.id]).length;
            const docsTotal = opp.documents.length;

            const verdictStyle =
              opp.eligibilityVerdict === 'Strong Match'
                ? 'text-emerald-700'
                : opp.eligibilityVerdict === 'Likely Eligible'
                ? 'text-blue-800'
                : 'text-amber-700';

            const VerdictIcon =
              opp.eligibilityVerdict === 'Strong Match'
                ? CheckCircle2
                : opp.eligibilityVerdict === 'Likely Eligible'
                ? ShieldCheck
                : CircleAlert;

            return (
              <article
                key={opp.id}
                className={`p-5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/80'
                }`}
                onClick={() => onSelect(opp)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Clean unboxed typographic metadata kicker (Zero-Pill Discipline) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mb-1.5">
                      <span className="font-medium text-slate-700">{opp.scope}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{opp.provider}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${verdictStyle}`}>
                        <VerdictIcon className="w-3.5 h-3.5 shrink-0" />
                        {opp.eligibilityVerdict}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                      {opp.name}
                    </h3>

                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {opp.whyItFits}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={isSaved ? `Remove ${opp.name} from saved` : `Save ${opp.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(opp);
                    }}
                    className={`p-2 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                      isSaved
                        ? 'text-blue-800 bg-blue-50 border-blue-200'
                        : 'text-slate-400 bg-white border-slate-200 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bottom structured tabular figures strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-slate-500 mr-1.5">Benefit:</span>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {opp.benefitAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 mr-1.5">Cycle:</span>
                      <span className="text-slate-700 font-medium">{opp.applicationWindow}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 tabular-nums">
                      Docs {docsReady}/{docsTotal}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-800">
                      {isSelected ? 'Viewing' : 'Inspect'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
