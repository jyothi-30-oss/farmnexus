import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, Phone, MapPin, Sprout, ShoppingCart, ShieldCheck, Calendar, LogOut } from 'lucide-react';

export const ProfilePage = () => {
  const { user, isFarmer, isBuyer, logout } = useAuth();
  const { t, translateCrop } = useLanguage();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              isFarmer ? 'bg-farm-600 shadow-farm-600/30' : 'bg-blue-600 shadow-blue-600/30'
            }`}>
              {isFarmer ? <Sprout className="w-8 h-8" /> : <ShoppingCart className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
              <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase mt-1 ${
                isFarmer ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isFarmer ? t('farmerRole') : t('buyerRole')} Account
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto border border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('navLogout')}
          </button>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {t('phone')}
            </span>
            <span className="font-bold text-gray-900">{user.phone}</span>
          </div>

          {isFarmer && (
            <>
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {t('village')}
                </span>
                <span className="font-semibold text-gray-900">{user.village}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {t('district')}, {t('state')}
                </span>
                <span className="font-semibold text-gray-900">{user.district}, {user.state}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <span className="text-gray-500 block mb-2 font-medium">
                  {t('cropsGrown')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(user.cropsGrown || []).map((crop) => (
                    <span
                      key={crop}
                      className="px-3 py-1 bg-farm-100 text-farm-900 rounded-lg text-xs font-bold border border-farm-200"
                    >
                      {translateCrop(crop)}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {isBuyer && (
            <>
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <span className="text-gray-500 flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {t('address')}
                </span>
                <span className="font-semibold text-gray-900 block">{user.address}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {t('villageCity')}
                </span>
                <span className="font-semibold text-gray-900">{user.villageCity}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {t('district')}, {t('state')}
                </span>
                <span className="font-semibold text-gray-900">{user.district}, {user.state}</span>
              </div>
            </>
          )}

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {t('memberSince')}
            </span>
            <span>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
