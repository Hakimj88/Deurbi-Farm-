import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'wo', label: 'ولوفل (Wolof)' }
  ];

  useEffect(() => {
    // Check if the current language is RTL
    const isRtl = i18n.language === 'ar' || i18n.language === 'wo';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl text-earth-400 hover:text-earth-900 hover:bg-earth-100 transition-colors"
      >
        <Globe className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full end-0 mt-2 bg-white rounded-xl shadow-xl border border-earth-100 w-40 z-[100] overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm font-bold transition-colors hover:bg-earth-50",
                i18n.language === lang.code ? "text-forest-600 bg-forest-50" : "text-earth-700"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
