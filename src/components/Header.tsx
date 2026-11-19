import React from 'react';

export type ActiveTab = 'finder' | 'saved' | 'vault' | 'portals';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onStartCheck: () => void;
  savedCount: number;
  readyDocCount: number;
  totalDocCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onStartCheck,
  savedCount,
  readyDocCount,
  totalDocCount,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; suffix?: string }> = [
    { id: 'finder', label: 'Finder' },
    { id: 'saved', label: 'Saved Schemes', suffix: savedCount > 0 ? `(${savedCount})` : undefined },
    {
      id: 'vault',
      label: 'Document Vault',
      suffix: totalDocCount > 0 ? `(${readyDocCount}/${totalDocCount})` : undefined,
    },
    { id: 'portals', label: 'Portal Directory' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('finder')}
          className="font-display text-xl font-bold tracking-tight text-slate-900 hover:text-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          ScholarSetu AI
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.suffix && (
                  <span className="ml-1.5 font-mono text-xs tabular-nums text-slate-500">
                    {item.suffix}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[21px] h-0.5 bg-blue-800"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartCheck}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Check Eligibility
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-5 overflow-x-auto text-xs font-medium bg-white"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'text-blue-800 font-semibold underline underline-offset-4'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
              {item.suffix ? ` ${item.suffix}` : ''}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
