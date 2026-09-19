import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import { 
  ListOrdered, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Tag, 
  Scale, 
  IndianRupee, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const FarmerListingsPage = ({ onNavigateSell }) => {
  const { token } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(getApiUrl('/api/listings/farmer'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load your listings.');
      }
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [token]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <ListOrdered className="w-7 h-7 text-farm-600" />
            {t('myListingsTitle')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('myListingsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchListings}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNavigateSell}
            className="px-4 py-2.5 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition flex items-center gap-2 text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            {t('sellCropAction')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-10 h-10 border-4 border-farm-200 border-t-farm-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">{t('loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-farm-50 text-farm-600 flex items-center justify-center mx-auto mb-4">
            <ListOrdered className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {t('noActiveListings')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            List crops directly from your fields and connect with genuine buyers with guaranteed zero intermediaries.
          </p>
          <button
            onClick={onNavigateSell}
            className="px-6 py-3 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {t('createFirstListing')}
          </button>
        </div>
      )}

      {/* Active Listings Grid */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 hover:border-farm-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                    {t('statusActive')}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Crop Title */}
                <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                  {translateCrop(listing.cropName)}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {listing.village}, {listing.district}, {listing.state}
                </p>

                {/* Quantities */}
                <div className="bg-gray-50 rounded-xl p-3.5 mb-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('availableQty')}:</span>
                    <span className="font-extrabold text-farm-800 text-sm">
                      {listing.availableQuantity} {listing.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>{t('initialQty')}:</span>
                    <span>{listing.initialQuantity} {listing.unit}</span>
                  </div>
                </div>

                {/* Pricing Display */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div className="bg-farm-50/50 p-2.5 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">
                      {t('marketRefPrice')}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      ₹{listing.marketPrice} <span className="text-[10px]">/ kg</span>
                    </span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="block text-[10px] uppercase font-bold text-emerald-800">
                      {t('finalPricePerUnit')}
                    </span>
                    <span className="text-base font-black text-emerald-900">
                      ₹{listing.finalPricePerUnit} <span className="text-[10px] font-normal">/ {listing.unit}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-400 text-center">
                Farmer Contact: <span className="font-semibold text-gray-700">{listing.farmerPhone}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
