import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Phone, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const LoginPage = ({ onNavigateRegisterFarmer, onNavigateRegisterBuyer }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(t('phoneInvalid'));
      return;
    }
    if (!password) {
      setError(t('fieldRequired'));
      return;
    }

    try {
      setLoading(true);
      await login(cleanPhone, password);
    } catch (err) {
      setError(err.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-farm-600 text-white shadow-lg shadow-farm-600/30 mb-4">
            <Sprout className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('loginTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t('phone')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? t('loggingIn') : t('loginBtn')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Registration Navigation */}
        <div className="pt-6 border-t border-gray-100 text-center space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('noAccount')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onNavigateRegisterFarmer}
              className="py-2.5 px-3 border border-farm-600 text-farm-700 hover:bg-farm-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              🌱 {t('registerAsFarmer')}
            </button>
            <button
              type="button"
              onClick={onNavigateRegisterBuyer}
              className="py-2.5 px-3 border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              🛒 {t('registerAsBuyer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
