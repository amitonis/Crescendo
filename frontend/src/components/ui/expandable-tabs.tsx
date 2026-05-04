import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ExpandableTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const ExpandableTabs: React.FC<ExpandableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn("flex flex-row gap-1 bg-white rounded-lg p-1 border border-[#E0E0D8] inline-flex", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 outline-none",
              isActive ? "text-[#1DA0C3]" : "text-[#666660] hover:text-[#1A1A1A]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabHighlight"
                className="absolute inset-0 bg-[#1DA0C3]/10 rounded-md"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative z-10 flex items-center justify-center min-w-[16px]">
              {tab.icon ? tab.icon : <span className="text-xs font-bold uppercase">{tab.label.charAt(0)}</span>}
            </div>

            <motion.div
              initial={false}
              animate={{
                width: isActive ? "auto" : 0,
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? 4 : 0
              }}
              className="relative z-10 overflow-hidden whitespace-nowrap text-sm font-medium"
            >
              {tab.label}
            </motion.div>
          </button>
        );
      })}
    </div>
  );
};
