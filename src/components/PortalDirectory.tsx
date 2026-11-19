import React, { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import { GOVERNMENT_PORTALS, type GovernmentPortal } from '../data/indianPortals';

interface PortalDirectoryProps {
  selectedState: string;
  onSelectStateForFinder: (stateName: string) => void;
}

type PortalScopeFilter = 'All' | 'Central' | 'State & UT';

export const PortalDirectory: React.FC<PortalDirectoryProps> = ({
  selectedState,
  onSelectStateForFinder,
}) => {
  const [scopeFilter, setScopeFilter] = useState<PortalScopeFilter>('All');
  const [search, setSearch] = useState('');

  const filteredPortals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GOVERNMENT_PORTALS.filter((p) => {
      if (scopeFilter !== 'All' && p.scope !== scopeFilter) return false;
      if (!q) return true;
      return (
        p.region.toLowerCase().includes(q) ||
        p.portalName.toLowerCase().includes(q) ||
        p.keySchemes.toLowerCase().includes(q)
      );
    });
  }, [scopeFilter, search]);

  const handleUseRegion = (portal: GovernmentPortal) => {
    if (portal.scope === 'State & UT') {
      const normalized = portal.region.includes('&')
        ? portal.region.split('&')[0].trim()
        : portal.region;
      onSelectStateForFinder(normalized);
    } else {
      onSelectStateForFinder(selectedState);
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-blue-800 mb-1.5">
              Verified Public Infrastructure · Official .gov.in &amp; .nic.in Portals
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Central &amp; State Scholarship Portal Directory
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              Always apply exclusively through official government portals. Never pay an intermediary fee to register for NSP, AICTE, UGC, or State DBT scholarships.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search state or scheme..."
                className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
              />
            </div>

            <div
              role="tablist"
              aria-label="Filter government portals"
              className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg shrink-0"
            >
              {(['All', 'Central', 'State & UT'] as PortalScopeFilter[]).map((scope) => {
                const active = scopeFilter === scope;
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clean High-Scannability Directory Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">Jurisdiction</th>
                <th className="py-3 px-4">Official Portal</th>
                <th className="py-3 px-4">Flagship Schemes Hosted</th>
                <th className="py-3 px-4">Authentication / KYC Requirement</th>
                <th className="py-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPortals.map((portal) => (
                <tr key={portal.id} className="align-top hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <span className="block font-semibold text-slate-900">{portal.region}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{portal.scope}</span>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-blue-800 hover:underline"
                    >
                      <span>{portal.portalName}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <span className="block font-mono text-xs text-slate-500 mt-0.5 break-all">
                      {portal.url.replace(/^https?:\/\//, '')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 leading-relaxed max-w-md">
                    {portal.keySchemes}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 leading-relaxed max-w-xs">
                    {portal.authRequirement}
                  </td>
                  <td className="py-4 pl-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleUseRegion(portal)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      Match Schemes
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPortals.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              No portals matched &ldquo;{search}&rdquo;. Try another state or scheme name.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
