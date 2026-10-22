import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getLanguageLabel(lang: string): string {
  switch (lang) {
    case 'hi':
      return 'Hindi (हिंदी)';
    case 'hi-en':
      return 'Hinglish (हिंग्लिश)';
    case 'en':
      return 'English';
    case 'ta':
      return 'Tamil (தமிழ்)';
    case 'te':
      return 'Telugu (తెలుగు)';
    case 'kn':
      return 'Kannada (ಕನ್ನಡ)';
    case 'mr':
      return 'Marathi (मराठी)';
    case 'bn':
      return 'Bengali (বাংলা)';
    case 'gu':
      return 'Gujarati (ગુજરાતી)';
    default:
      return lang.toUpperCase();
  }
}
