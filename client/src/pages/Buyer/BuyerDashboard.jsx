import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import { 
  ShoppingCart, 
  Search, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  ShieldCheck 
} from 'lucide-react';

export const BuyerDashboard = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!token) return;
      try {
        const [listingsRes, ordersRes] = await Promise.all([
          fetch(getApiUrl('/api/listings'), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(getApiUrl('/api/orders/buyer'), { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const listData = await listingsRes.json();
        const orderData = await ordersRes.json();
        if (listData.success) setActiveListingsCount(listData.listings?.length || 0);
        if (orderData.success) setOrdersCount(orderData.orders?.length || 0);
      } catch (err) {
        console.warn('Could not load buyer dashboard stats:', err);
      }
    };
    fetchCounts();
  }, [token]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Buyer Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-700/30 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/80 text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            {t('buyerRole')} Dashboard
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('buyerWelcome')}, <span className="text-blue-200">{user?.name}</span>!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Source harvest directly from verified farmers. No commissions, no intermediaries.
          </p>
        </div>
      </div>

      {/* Details & Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Buyer Profile Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 md:col-span-1">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Your Registered Details
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{t('buyerName')}:</span>
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
                Delivery Address:
              </span>
              <span className="font-semibold text-gray-800 block">
                {user?.address}
              </span>
              <span className="text-xs text-gray-500 block mt-0.5">
                {user?.villageCity}, {user?.district}, {user?.state}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Browse Available Crops (Clickable Card) */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => onNavigate && onNavigate('browse-crops')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate && onNavigate('browse-crops');
            }
          }}
          aria-label="Browse Available Crops"
          className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 hover:border-farm-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-farm-500 focus:ring-offset-2"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-farm-50 text-farm-700 flex items-center justify-center mb-4 group-hover:bg-farm-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-farm-700 block mb-1">
              Active Marketplace
            </span>
            <h3 className="text-xl font-black text-gray-900 group-hover:text-farm-900 transition-colors mb-2">
              {t('browseCropsTitle')}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore farmer-listed harvest with transparent fixed prices. Request purchase by simply specifying required quantity.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-farm-700">
            <span>{activeListingsCount} crops available</span>
          </div>
        </div>

        {/* Section 2: My Orders (Clickable Card) */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => onNavigate && onNavigate('my-orders')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate && onNavigate('my-orders');
            }
          }}
          aria-label="My Orders"
          className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
              Order Fulfilment
            </span>
            <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-900 transition-colors mb-2">
              {t('navMyOrders')}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Track requests, view accepted status, delivery charges added by farmers, and contact farmers directly.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-blue-700">
            <span>{ordersCount} orders tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
