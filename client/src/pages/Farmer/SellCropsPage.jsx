import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MARKET_PRICES, VALID_UNITS } from '../../constants/crops';
import { getApiUrl } from '../../config/api';
import { 
  Sprout, 
  ArrowLeft, 
  TrendingUp, 
  IndianRupee, 
  Layers, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

export const SellCropsPage = ({ onBack, onNavigateListings }) => {
  const { token, user } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expectedPricePerUnit, setExpectedPricePerUnit] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Farmer's registered crops from their profile/registration
  const farmerCrops = Array.isArray(user?.cropsGrown) ? user.cropsGrown : [];

  // Reference Market Price (automatically shown when crop selected)
  const referencePrice = cropName ? MARKET_PRICES[cropName] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (farmerCrops.length === 0) {
      setError(t('noCropsRegistered'));
      return;
    }

    // Validations
    if (!cropName) {
      setError(t('fieldRequired') + ': ' + t('selectCrop'));
      return;
    }

    if (!farmerCrops.includes(cropName)) {
      setError(`You can only list crops that you selected during registration.`);
      return;
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (!unit) {
      setError(t('fieldRequired') + ': ' + t('unit'));
      return;
    }

    const numPrice = Number(expectedPricePerUnit);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Expected Price Per Unit must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(getApiUrl('/api/listings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cropName,
          quantity: numQuantity,
          unit,
          expectedPricePerUnit: numPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create listing.');
      }

      setSuccess(t('listingSuccessMsg'));
      setTimeout(() => {
        onNavigateListings();
      }, 1200);
    } catch (err) {
      setError(err.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <Sprout className="w-7 h-7 text-farm-600" />
              {t('sellCropsTitle')}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {t('sellCropsSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('backBtn')}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-farm-50 border border-farm-200 text-farm-800 text-sm flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-farm-600" />
            <span>{success}</span>
          </div>
        )}

        {farmerCrops.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">{t('noCropsRegistered')}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Crop Selection (Filtered to Farmer's registered crops) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                {t('selectCrop')} *
              </label>
              {farmerCrops.length > 0 && (
                <span className="text-[11px] text-farm-700 font-semibold">
                  {farmerCrops.length} {farmerCrops.length === 1 ? 'crop' : 'crops'} available
                </span>
              )}
            </div>

            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 disabled:opacity-50"
              required
              disabled={farmerCrops.length === 0}
            >
              <option value="">{t('chooseCrop')}</option>
              {farmerCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {translateCrop(crop)}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Market Price (Auto-displayed upon crop selection) */}
          {cropName && referencePrice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-farm-50 border border-emerald-200 text-emerald-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-farm-700" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-farm-800 block">
                      {t('refMarketPriceLabel')}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {t('refMarketPriceNotice')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-farm-800">₹{referencePrice}</span>
                  <span className="text-xs text-gray-500 font-medium"> / kg</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                {t('quantity')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Layers className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={t('quantityPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 disabled:opacity-50"
                  required
                  disabled={farmerCrops.length === 0}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                {t('unit')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Scale className="w-4 h-4" />
                </div>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 disabled:opacity-50"
                  required
                  disabled={farmerCrops.length === 0}
                >
                  <option value="kg">{t('unitKg')}</option>
                  <option value="quintal">{t('unitQuintal')}</option>
                  <option value="tonne">{t('unitTonne')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Expected Price Per Unit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t('expectedPriceLabel')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0.01"
                step="any"
                value={expectedPricePerUnit}
                onChange={(e) => setExpectedPricePerUnit(e.target.value)}
                placeholder={t('expectedPricePlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 disabled:opacity-50"
                required
                disabled={farmerCrops.length === 0}
              />
            </div>
            <p className="mt-1.5 text-xs text-farm-800 font-medium">
              💡 {t('expectedPriceHelp')}
            </p>
          </div>

          {/* Buttons: Submit & Back */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || farmerCrops.length === 0}
              className="flex-1 py-3.5 px-6 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              {loading ? t('submittingListing') : t('submitListingBtn')}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
            >
              {t('backBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
