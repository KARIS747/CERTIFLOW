import React from 'react';
import { motion } from 'framer-motion';

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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md max-w-lg mx-auto my-8 shadow-xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400 shadow-inner">
        <Icon className="w-8 h-8 animate-pulse" />
      </div>

      <h3 className="text-xl font-bold font-outfit text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>

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
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all duration-200"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
};
