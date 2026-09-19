import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Globe } from 'lucide-react';

const languages = [
  {
    code: 'en',
    label: 'English',
    native: 'English',
    desc: 'Continue in English',
  },
  {
    code: 'te',
    label: 'Telugu',
    native: 'తెలుగు',
    desc: 'తెలుగులో కొనసాగండి',
  },
  {
    code: 'hi',
    label: 'Hindi',
    native: 'हिंदी',
    desc: 'हिंदी में आगे बढ़ें',
  },
];

export const LanguageSelectorModal = () => {
  const { language, setLanguage, confirmLanguageSelection } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-br from-farm-700 to-farm-900 px-6 py-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-md mb-3">
            <Globe className="w-8 h-8 text-farm-200" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Select Your Language</h2>
          <p className="text-farm-100 text-sm mt-1">మీ భాషను ఎంచుకోండి / अपनी भाषा चुनें</p>
        </div>

        <div className="p-6 space-y-3">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-farm-600 bg-farm-50/70 text-farm-950 font-semibold shadow-sm'
                    : 'border-gray-200 hover:border-farm-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <div className="text-lg font-bold">{lang.native}</div>
                  <div className="text-xs text-gray-500">{lang.label} &bull; {lang.desc}</div>
                </div>
                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-farm-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => confirmLanguageSelection(language)}
            className="w-full mt-4 bg-farm-700 hover:bg-farm-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] text-center"
          >
            {language === 'te' ? 'కొనసాగించండి' : language === 'hi' ? 'आगे बढ़ें' : 'Continue'} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
