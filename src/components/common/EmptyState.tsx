import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../lib/useTheme';

interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { isLight, t } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border backdrop-blur-md max-w-lg mx-auto my-8 shadow-xl ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900/40 border-slate-800/80'
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-500 shadow-inner">
        <Icon className="w-8 h-8 animate-pulse" />
      </div>

      <h3 className={`text-xl font-bold font-outfit mb-2 ${t.textPrimary}`}>{title}</h3>
      <p className={`text-sm mb-6 leading-relaxed ${t.textSecondary}`}>{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all duration-200 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
};
