import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-farm-600 text-white flex items-center justify-center">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-gray-900">FarmNexus</span> &mdash; {t('tagline')}
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-farm-600" />
            Direct Farmer &bull; Direct Buyer
          </span>
          <span>&copy; {new Date().getFullYear()} FarmNexus</span>
        </div>
      </div>
    </footer>
  );
};
