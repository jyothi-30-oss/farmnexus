import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CROPS_LIST } from '../../constants/crops';
import { Sprout, Phone, Lock, User, MapPin, Building, Check, AlertCircle, ArrowRight } from 'lucide-react';

export const FarmerRegisterPage = ({ onNavigateLogin, onNavigateRegisterBuyer }) => {
  const { registerFarmer } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    village: '',
    district: '',
    state: '',
    cropsGrown: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCrop = (crop) => {
    setFormData((prev) => {
      const exists = prev.cropsGrown.includes(crop);
      if (exists) {
        return { ...prev, cropsGrown: prev.cropsGrown.filter((c) => c !== crop) };
      } else {
        return { ...prev, cropsGrown: [...prev.cropsGrown, crop] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formData.phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(t('phoneInvalid'));
      return;
    }
    if (formData.password.length < 6) {
      setError(t('passwordLength'));
      return;
    }
    if (formData.cropsGrown.length === 0) {
      setError(t('cropsGrownHint'));
      return;
    }

    try {
      setLoading(true);
      await registerFarmer({
        ...formData,
        phone: cleanPhone,
      });
    } catch (err) {
      setError(err.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-farm-600 text-white shadow-lg shadow-farm-600/30 mb-3">
            <Sprout className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('farmerRegTitle')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('farmerRegSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Farmer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('farmerName')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('farmerNamePlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          {/* Phone & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('phone')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('phonePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('password')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Details: Village, District, State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('village')} *
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder={t('villagePlaceholder')}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('district')} *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder={t('districtPlaceholder')}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                {t('state')} *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder={t('statePlaceholder')}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                required
              />
            </div>
          </div>

          {/* Crops Grown (Multi-select) */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('cropsGrown')} *
            </label>
            <p className="text-xs text-gray-500 mb-2.5">{t('cropsGrownHint')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CROPS_LIST.map((crop) => {
                const isSelected = formData.cropsGrown.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'border-farm-600 bg-farm-50 text-farm-900 shadow-2xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{translateCrop(crop)}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-farm-600 border-farm-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? t('saving') : t('registerFarmerBtn')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-gray-600 hover:text-farm-700 font-semibold"
          >
            {t('haveAccount')} <span className="text-farm-600 underline font-bold">{t('signInHere')}</span>
          </button>
          <button
            type="button"
            onClick={onNavigateRegisterBuyer}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            {t('registerAsBuyer')} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
