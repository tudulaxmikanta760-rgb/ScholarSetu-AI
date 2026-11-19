import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Compass,
  FileCheck2,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { DocumentVault } from './components/DocumentVault';
import { Header, type ActiveTab } from './components/Header';
import { OpportunityDetail } from './components/OpportunityDetail';
import { OpportunityList } from './components/OpportunityList';
import { PortalDirectory } from './components/PortalDirectory';
import { ProfileForm } from './components/ProfileForm';
import { DEFAULT_PROFILE } from './data/indianPortals';
import type {
  DiscoveryResult,
  MasterDocument,
  ScholarshipOpportunity,
  StudentProfile,
} from './types';

const HERO_IMAGE_URL = '/src/assets/images/hero_indian_scholars_1795101158354.jpg';

const STORAGE_KEYS = {
  profile: 'scholarsetu_profile_v1',
  saved: 'scholarsetu_saved_v1',
  docs: 'scholarsetu_checked_docs_v1',
  lastResult: 'scholarsetu_last_result_v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('finder');
  const [profile, setProfile] = useState<StudentProfile>(() =>
    loadJson<StudentProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE)
  );
  const [result, setResult] = useState<DiscoveryResult | null>(() =>
    loadJson<DiscoveryResult | null>(STORAGE_KEYS.lastResult, null)
  );
  const [savedSchemes, setSavedSchemes] = useState<ScholarshipOpportunity[]>(() =>
    loadJson<ScholarshipOpportunity[]>(STORAGE_KEYS.saved, [])
  );
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>(() =>
    loadJson<Record<string, boolean>>(STORAGE_KEYS.docs, {})
  );

  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } catch {
      // ignore storage quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedSchemes));
    } catch {
      // ignore
    }
  }, [savedSchemes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.docs, JSON.stringify(checkedDocs));
    } catch {
      // ignore
    }
  }, [checkedDocs]);

  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem(STORAGE_KEYS.lastResult, JSON.stringify(result));
      }
    } catch {
      // ignore
    }
  }, [result]);

  // Ensure a default selected opportunity whenever result loads
  useEffect(() => {
    if (result && result.opportunities.length > 0) {
      const stillExists = result.opportunities.some((o) => o.id === selectedOppId);
      if (!stillExists) {
        setSelectedOppId(result.opportunities[0].id);
      }
    }
  }, [result, selectedOppId]);

  useEffect(() => {
    if (savedSchemes.length > 0) {
      const exists = savedSchemes.some((o) => o.id === selectedSavedId);
      if (!exists) {
        setSelectedSavedId(savedSchemes[0].id);
      }
    } else {
      setSelectedSavedId(null);
    }
  }, [savedSchemes, selectedSavedId]);

  const savedIds = useMemo(() => savedSchemes.map((s) => s.id), [savedSchemes]);

  const masterDocuments: MasterDocument[] = useMemo(() => {
    if (result?.masterChecklist && result.masterChecklist.length > 0) {
      return result.masterChecklist;
    }
    // Derive from saved schemes if no active search result
    const byId = new Map<string, MasterDocument>();
    for (const scheme of savedSchemes) {
      for (const doc of scheme.documents) {
        const existing = byId.get(doc.id);
        if (existing) {
          if (!existing.usedBySchemes.includes(scheme.name)) {
            existing.usedBySchemes.push(scheme.name);
          }
        } else {
          byId.set(doc.id, {
            id: doc.id,
            name: doc.name,
            issuingAuthority: doc.issuingAuthority,
            usedBySchemes: [scheme.name],
            priority: 'Core Foundation',
            preparationTip: doc.tip,
          });
        }
      }
    }
    return Array.from(byId.values());
  }, [result, savedSchemes]);

  const readyDocCount = useMemo(
    () => masterDocuments.filter((d) => checkedDocs[d.id]).length,
    [masterDocuments, checkedDocs]
  );

  const handleDiscover = async (overrideProfile?: StudentProfile) => {
    const targetProfile = overrideProfile ?? profile;
    setActiveTab('finder');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/scholarships/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: targetProfile }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not retrieve scholarship matches.');
      }
      setResult(data as DiscoveryResult);
      if (Array.isArray(data.opportunities) && data.opportunities.length > 0) {
        setSelectedOppId(data.opportunities[0].id);
      }
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the eligibility engine. Please retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setErrorMsg(null);
  };

  const handleToggleSave = (opportunity: ScholarshipOpportunity) => {
    setSavedSchemes((prev) => {
      const exists = prev.some((s) => s.id === opportunity.id);
      if (exists) {
        return prev.filter((s) => s.id !== opportunity.id);
      }
      return [opportunity, ...prev];
    });
  };

  const handleToggleDoc = (docId: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleClearCheckedDocs = () => {
    setCheckedDocs({});
  };

  const scrollToForm = () => {
    setActiveTab('finder');
    setTimeout(() => {
      const el = document.getElementById('eligibility-form');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSelectStateFromDirectory = (stateName: string) => {
    const nextProfile: StudentProfile = { ...profile, state: stateName };
    setProfile(nextProfile);
    scrollToForm();
  };

  const selectedOpportunity = useMemo(() => {
    if (!result?.opportunities.length) return null;
    return (
      result.opportunities.find((o) => o.id === selectedOppId) ??
      result.opportunities[0]
    );
  }, [result, selectedOppId]);

  const selectedSavedOpportunity = useMemo(() => {
    if (!savedSchemes.length) return null;
    return (
      savedSchemes.find((o) => o.id === selectedSavedId) ?? savedSchemes[0]
    );
  }, [savedSchemes, selectedSavedId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onStartCheck={scrollToForm}
        savedCount={savedSchemes.length}
        readyDocCount={readyDocCount}
        totalDocCount={masterDocuments.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {activeTab === 'finder' && (
          <>
            {/* Editorial 2-Column Stretched Hero */}
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6">
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-3">
                      Central &amp; State Government Scholarship Advisory · India
                    </p>
                    <h1
                      className="font-display font-bold tracking-tight text-slate-900 leading-[1.12] max-w-2xl"
                      style={{
                        fontSize: 'clamp(2rem, 3.6vw, 3.25rem)',
                        textWrap: 'balance',
                      }}
                    >
                      Find every scholarship and government grant you qualify for.
                    </h1>
                    <p className="text-base text-slate-600 mt-4 max-w-xl leading-relaxed">
                      Enter your academic qualification, reservation category, family income, and state domicile. ScholarSetu AI maps Central and State schemes, explains every eligibility rule in plain language, and builds your ready-to-submit document checklist.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Start Eligibility Check
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('portals')}
                      className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Browse Official Portals
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 relative min-h-[260px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200">
                  {!heroImgFailed ? (
                    <img
                      src={HERO_IMAGE_URL}
                      alt="Indian university students collaborating around a sunlit academic library table"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full lg:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-100 to-blue-50">
                      <GraduationCap className="w-10 h-10 text-blue-800 mb-3" />
                      <span className="font-display text-base font-semibold text-slate-900">
                        Bridging Students to Public Education Funding
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Full-Width 4-Column Proof & Coverage Strip below Hero Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="p-5">
                  <span className="block font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    36 States &amp; UTs
                  </span>
                  <span className="block text-xs text-slate-600 mt-1">
                    Covers NSP, AICTE, UGC, DST &amp; State DBT portals
                  </span>
                </div>
                <div className="p-5">
                  <span className="block font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    Rule-by-Rule
                  </span>
                  <span className="block text-xs text-slate-600 mt-1">
                    Transparent checks for marks, income, category &amp; domicile
                  </span>
                </div>
                <div className="p-5">
                  <span className="block font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    Live Search
                  </span>
                  <span className="block text-xs text-slate-600 mt-1">
                    On-demand web verification for current portal notices
                  </span>
                </div>
                <div className="p-5">
                  <span className="block font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    1 Master Vault
                  </span>
                  <span className="block text-xs text-slate-600 mt-1">
                    Deduplicated document checklist synced across schemes
                  </span>
                </div>
              </div>
            </section>

            {/* Student Profile Input Form */}
            <ProfileForm
              profile={profile}
              onChange={setProfile}
              onSubmit={handleDiscover}
              onReset={handleReset}
              isLoading={isLoading}
            />

            {/* Error State */}
            {errorMsg && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">
                      Eligibility analysis could not be completed
                    </h3>
                    <p className="text-sm text-red-800 mt-0.5">{errorMsg}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDiscover()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-900 bg-white border border-red-300 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Match
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <section
                aria-busy="true"
                aria-label="Analyzing student eligibility"
                className="space-y-4"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 animate-pulse">
                  <div className="h-4 w-56 bg-slate-200 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse"
                      >
                        <div className="h-3 w-40 bg-slate-200 rounded" />
                        <div className="h-5 w-4/5 bg-slate-200 rounded" />
                        <div className="h-3 w-full bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-7 space-y-4 animate-pulse">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-7 w-2/3 bg-slate-200 rounded" />
                    <div className="h-24 w-full bg-slate-100 rounded" />
                    <div className="h-40 w-full bg-slate-100 rounded" />
                  </div>
                </div>
              </section>
            )}

            {/* Matched Results Workspace */}
            {!isLoading && result && (
              <div ref={resultsSectionRef} className="space-y-6 scroll-mt-20">
                {/* Advisor Summary Header */}
                <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-blue-800">
                          Step 02 · Matched Opportunities
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-700">
                          {result.opportunities.length} schemes found
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {profile.state} · {profile.category} · {profile.annualIncome}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-bold text-slate-900">
                        Your Personalized Scholarship &amp; Opportunity Roadmap
                      </h2>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {result.profileSummary}
                      </p>
                      <p className="text-xs text-slate-600 pt-1">
                        <span className="font-semibold text-slate-800">
                          Application Strategy:
                        </span>{' '}
                        {result.recommendedStrategy}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab('vault')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4 text-blue-800" />
                        Open Document Vault ({readyDocCount}/{masterDocuments.length})
                      </button>
                    </div>
                  </div>
                </section>

                {/* Split Master-Detail Results */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5">
                    <OpportunityList
                      opportunities={result.opportunities}
                      selectedId={selectedOpportunity?.id ?? null}
                      onSelect={(opp) => setSelectedOppId(opp.id)}
                      savedIds={savedIds}
                      onToggleSave={handleToggleSave}
                      checkedDocs={checkedDocs}
                    />
                  </div>
                  <div className="lg:col-span-7">
                    {selectedOpportunity && (
                      <OpportunityDetail
                        opportunity={selectedOpportunity}
                        profile={profile}
                        isSaved={savedIds.includes(selectedOpportunity.id)}
                        onToggleSave={handleToggleSave}
                        checkedDocs={checkedDocs}
                        onToggleDoc={handleToggleDoc}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Initial Empty Guidance before First Run */}
            {!isLoading && !result && !errorMsg && (
              <section className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <Compass className="w-6 h-6 text-blue-800 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      Ready to map your Central and State eligibility
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                      Complete the student profile above—or select one of the three sample student profiles—to generate matched schemes, criterion-by-criterion eligibility tables, and a unified document checklist.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDiscover()}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Run with Current Profile
                </button>
              </section>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-blue-800 mb-1">
                  Shortlisted Opportunities
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Saved Scholarships &amp; Grants
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Review your bookmarked opportunities, track document readiness, and open official portals when applications open.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('finder')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Back to Finder
              </button>
            </div>

            {savedSchemes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-xl mx-auto">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  No saved schemes yet
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Bookmark any matched scholarship in the Finder to keep its eligibility table, portal link, and document checklist pinned here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('finder')}
                  className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                >
                  Find Scholarships
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5">
                  <OpportunityList
                    opportunities={savedSchemes}
                    selectedId={selectedSavedOpportunity?.id ?? null}
                    onSelect={(opp) => setSelectedSavedId(opp.id)}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    checkedDocs={checkedDocs}
                    emptyMessage="No saved schemes match your filter."
                  />
                </div>
                <div className="lg:col-span-7">
                  {selectedSavedOpportunity && (
                    <OpportunityDetail
                      opportunity={selectedSavedOpportunity}
                      profile={profile}
                      isSaved={true}
                      onToggleSave={handleToggleSave}
                      checkedDocs={checkedDocs}
                      onToggleDoc={handleToggleDoc}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'vault' && (
          <DocumentVault
            documents={masterDocuments}
            checkedDocs={checkedDocs}
            onToggleDoc={handleToggleDoc}
            onClearChecked={handleClearCheckedDocs}
            profile={profile}
            onGoToFinder={scrollToForm}
          />
        )}

        {activeTab === 'portals' && (
          <PortalDirectory
            selectedState={profile.state}
            onSelectStateForFinder={handleSelectStateFromDirectory}
          />
        )}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display font-semibold text-slate-800">ScholarSetu AI</span>
            <span aria-hidden="true">·</span>
            <span>
              Advisory guide only—verify final deadlines and notifications on official government portals before submitting.
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('portals')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Official Portals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Document Checklist
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
