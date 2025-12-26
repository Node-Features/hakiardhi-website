'use client';

import { useState, useRef, useEffect } from 'react';

type Language = 'en' | 'sw';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇬🇧' },
  sw: { name: 'Kiswahili', flag: '🇹🇿' }
};

export default function LanguageSwitcher({
  variant = 'dropdown',
  theme = 'light',
  size = 'md',
  className = ''
}: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('hakiardhi-lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'sw')) {
      setCurrentLang(savedLang);
      document.documentElement.lang = savedLang;
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    localStorage.setItem('hakiardhi-lang', lang);
    document.documentElement.lang = lang;

    // Dispatch custom event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  // Toggle variant
  if (variant === 'toggle') {
    const baseClasses = size === 'sm' ? 'text-xs' : 'text-sm';
    const buttonClasses = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2';

    return (
      <div
        className={`inline-flex rounded-full overflow-hidden shadow-lg ${
          theme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm'
            : 'bg-gray-100'
        } ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          onClick={() => changeLanguage('en')}
          className={`${buttonClasses} ${baseClasses} font-bold tracking-wide transition-all duration-300 ${
            currentLang === 'en'
              ? 'bg-gradient-to-r from-hakiardhi-red to-red-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={currentLang === 'en'}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('sw')}
          className={`${buttonClasses} ${baseClasses} font-bold tracking-wide transition-all duration-300 ${
            currentLang === 'sw'
              ? 'bg-gradient-to-r from-hakiardhi-red to-red-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={currentLang === 'sw'}
          aria-label="Switch to Kiswahili"
        >
          SW
        </button>
      </div>
    );
  }

  // Dropdown variant
  const baseClasses = size === 'sm' ? 'text-xs' : 'text-sm';
  const buttonPadding = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2.5';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group inline-flex items-center gap-2 ${buttonPadding} ${baseClasses} font-semibold rounded-full transition-all duration-300 ${
          theme === 'dark'
            ? `bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 ${isOpen ? 'bg-white/20 ring-2 ring-hakiardhi-red/50' : ''}`
            : `bg-gray-100 text-gray-700 hover:bg-gray-200 ${isOpen ? 'bg-gray-200 ring-2 ring-hakiardhi-red/30' : ''}`
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${languages[currentLang].name}. Click to change language.`}
      >
        {/* Globe icon with animation */}
        <svg
          className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 group-hover:rotate-12 ${
            theme === 'dark' ? 'text-white' : 'text-hakiardhi-red'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span className="font-bold tracking-wide">{currentLang.toUpperCase()}</span>
        {/* Chevron with rotation */}
        <svg
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${
            theme === 'dark' ? 'text-white/60' : 'text-gray-400'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu with enhanced styling */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 ${
            theme === 'dark'
              ? 'bg-gray-900/95 backdrop-blur-xl border border-white/10'
              : 'bg-white border border-gray-200'
          }`}
          role="listbox"
          aria-label="Available languages"
        >
          <div className="py-2">
            {(Object.keys(languages) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                  currentLang === lang
                    ? theme === 'dark'
                      ? 'bg-hakiardhi-red/20 text-hakiardhi-red'
                      : 'bg-hakiardhi-red/10 text-hakiardhi-red'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                role="option"
                aria-selected={currentLang === lang}
              >
                {/* Flag emoji */}
                <span className="text-lg">{languages[lang].flag}</span>

                {/* Language name */}
                <span className={`flex-1 ${baseClasses} ${currentLang === lang ? 'font-bold' : 'font-medium'}`}>
                  {languages[lang].name}
                </span>

                {/* Checkmark for selected */}
                {currentLang === lang && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-hakiardhi-red">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className={`px-4 py-2 text-[10px] border-t ${
            theme === 'dark'
              ? 'border-white/10 text-gray-500'
              : 'border-gray-100 text-gray-400'
          }`}>
            {currentLang === 'en' ? 'Select your preferred language' : 'Chagua lugha unayopendelea'}
          </div>
        </div>
      )}
    </div>
  );
}
