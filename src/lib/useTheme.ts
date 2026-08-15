import { useUIStore } from '../store/useUIStore';

/**
 * useTheme — Hook centralisé pour accéder au thème courant
 * Retourne isLight pour brancher les classes conditionnelles
 */
export function useTheme() {
  const { theme, setTheme } = useUIStore();

  const isLight =
    theme === 'light' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  /** Classes Tailwind prédéfinies pour les éléments courants */
  const t = {
    // Fonds
    bgBase:    isLight ? 'bg-slate-100'          : 'bg-slate-950',
    bgSurface: isLight ? 'bg-white'              : 'bg-slate-900',
    bgCard:    isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-800/60 border border-slate-700/60',
    bgInput:   isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700',
    bgHover:   isLight ? 'hover:bg-slate-100'    : 'hover:bg-slate-800/60',

    // Textes
    textPrimary:   isLight ? 'text-slate-900'   : 'text-slate-100',
    textSecondary: isLight ? 'text-slate-600'   : 'text-slate-400',
    textMuted:     isLight ? 'text-slate-400'   : 'text-slate-500',

    // Bordures
    border:      isLight ? 'border-slate-200'   : 'border-slate-800',
    borderLight: isLight ? 'border-slate-300'   : 'border-slate-700',

    // Dividers
    divide:      isLight ? 'divide-slate-200'   : 'divide-slate-800',

    // Badge / pill
    pill:        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return { theme, setTheme, isLight, t };
}
