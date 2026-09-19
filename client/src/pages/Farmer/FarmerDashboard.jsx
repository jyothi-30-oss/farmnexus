import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MARKET_PRICES } from '../../constants/crops';
import { 
  Sprout, 
  MapPin, 
  Phone, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck 
} from 'lucide-react';

export const FarmerDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, translateCrop } = useLanguage();

  const farmerCrops = user?.cropsGrown || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-farm-800 to-farm-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-farm-700/30 blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-farm-700/80 text-farm-100 text-xs font-bold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5" />
            {t('farmerRole')} Dashboard
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('welcomeFarmer')}, <span className="text-farm-200">{user?.name}</span>!
          </h1>
          <p className="text-farm-100 text-sm mt-1 max-w-xl">
            {t('tagline')} &bull; Direct access to buyers with zero middlemen.
          </p>
        </div>
      </div>

      {/* Farmer Profile Card & Key Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-farm-600" />
            {t('farmerDetailsCard')}
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{t('farmerName')}:</span>
              <span className="font-bold text-gray-900">{user?.name}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {t('phone')}:
              </span>
              <span className="font-bold text-gray-900">{user?.phone}</span>
            </div>

            <div className="py-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {t('farmerLocation')}:
              </span>
              <span className="font-semibold text-gray-800">
                {user?.village}, {user?.district}, {user?.state}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-gray-500 block mb-2 font-medium">{t('registeredCrops')}:</span>
              <div className="flex flex-wrap gap-1.5">
                {farmerCrops.map((crop) => (
                  <span
                    key={crop}
                    className="px-2.5 py-1 rounded-lg bg-farm-50 text-farm-800 border border-farm-200 text-xs font-semibold"
                  >
                    {translateCrop(crop)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Market Reference Prices Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-farm-600" />
                {t('marketPricesTitle')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('marketPricesSubtitle')}
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start">
              Reference Benchmark
            </span>
          </div>

          {/* Reference Prices Table for Farmer's Selected Crops (Crop, Reference Market Price, Unit) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-semibold">{t('cropHeader')}</th>
                  <th className="pb-3 font-semibold text-right">{t('refPriceHeader')}</th>
                  <th className="pb-3 font-semibold text-right">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {farmerCrops.map((crop) => {
                  const refPrice = MARKET_PRICES[crop] || 'N/A';
                  return (
                    <tr key={crop} className="hover:bg-farm-50/50 transition">
                      <td className="py-3.5 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-farm-500"></span>
                        {translateCrop(crop)}
                      </td>
                      <td className="py-3.5 font-bold text-farm-700 text-right">
                        ₹{refPrice}
                      </td>
                      <td className="py-3.5 text-gray-500 text-right text-xs">
                        per kg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Critical Note on Pricing Rules */}
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{t('finalPriceNote')}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
