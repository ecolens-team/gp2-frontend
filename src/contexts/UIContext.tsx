/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface MobileTitleBar {
  title: string;
  fallbackPath?: string;
}

interface UIContextValue {
  mobileTitleBar: MobileTitleBar | null;
  hideBottomNav: boolean;
  headerVisible: boolean;
  setMobileTitleBar: (v: MobileTitleBar | null) => void;
  setHideBottomNav: (v: boolean) => void;
  setHeaderVisible: (v: boolean) => void;
  inboxTabsVisible: boolean;
  setInboxTabsVisible: (v: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [mobileTitleBar, setMobileTitleBar] = useState<MobileTitleBar | null>(
    null,
  );
  const [hideBottomNav, setHideBottomNav] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [inboxTabsVisible, setInboxTabsVisible] = useState(true);

  return (
    <UIContext.Provider
      value={{
        mobileTitleBar,
        hideBottomNav,
        setMobileTitleBar,
        setHideBottomNav,
        headerVisible,
        setHeaderVisible,
        inboxTabsVisible,
        setInboxTabsVisible,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext must be used inside UIProvider');
  return ctx;
}

interface PageLayoutOptions {
  mobileTitleBar?: MobileTitleBar;
  hideBottomNav?: boolean;
}

/** Call at the top of a page component to control mobile layout for that page. */
export function usePageLayout({
  mobileTitleBar,
  hideBottomNav,
}: PageLayoutOptions) {
  const { setMobileTitleBar, setHideBottomNav } = useUIContext();

  useEffect(() => {
    if (mobileTitleBar !== undefined) setMobileTitleBar(mobileTitleBar);
    if (hideBottomNav !== undefined) setHideBottomNav(hideBottomNav);
    return () => {
      if (mobileTitleBar !== undefined) setMobileTitleBar(null);
      if (hideBottomNav !== undefined) setHideBottomNav(false);
    };
  }, []);
}
