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
  AlertCircle,
  Edit3,
  Check,
  CheckCircle
} from 'lucide-react';

export const FarmerListingsPage = ({ onNavigateSell }) => {
  const { token } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Price States
  const [editingListingId, setEditingListingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleStartEdit = (listing) => {
    setEditingListingId(listing.id);
    setNewPrice(String(listing.finalPricePerUnit || ''));
    setEditError('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingListingId(null);
    setNewPrice('');
    setEditError('');
  };

  const handleUpdatePrice = async (listingId) => {
    setEditError('');
    const parsedPrice = Number(newPrice);
    if (!newPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditError(t('pricePositiveError') || 'Expected price must be a valid positive number.');
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(getApiUrl(`/api/listings/${listingId}/price`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expectedPricePerUnit: parsedPrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update expected price.');
      }

      // Update listings state locally
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, finalPricePerUnit: parsedPrice } : l))
      );
      setSuccessMessage(t('priceUpdateSuccess') || 'Expected price updated successfully.');
      setEditingListingId(null);
      setNewPrice('');

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      setEditError(err.message || t('genericError') || 'Something went wrong.');
    } finally {
      setUpdating(false);
    }
  };

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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
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

                {/* Edit Expected Price Section */}
                {editingListingId === listing.id ? (
                  <div className="mt-4 p-4 bg-farm-50/80 rounded-2xl border border-farm-200 space-y-3">
                    <div className="text-xs text-gray-700">
                      <span className="font-medium text-gray-500">{t('currentExpectedPriceLabel')}: </span>
                      <span className="font-extrabold text-gray-900">₹{listing.finalPricePerUnit} / {listing.unit}</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                        {t('newExpectedPriceLabel')}:
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <IndianRupee className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={newPrice}
                          onChange={(e) => {
                            setNewPrice(e.target.value);
                            setEditError('');
                          }}
                          placeholder="e.g. 28"
                          className="w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-500 focus:border-farm-500 text-xs sm:text-sm font-semibold text-gray-900 bg-white"
                          autoFocus
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          /{listing.unit}
                        </div>
                      </div>
                    </div>

                    {editError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {editError}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleUpdatePrice(listing.id)}
                        disabled={updating}
                        className="flex-1 py-2 px-3 bg-farm-600 hover:bg-farm-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        {updating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            {t('updatingPrice')}
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t('updatePriceBtn')}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={updating}
                        className="py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg transition"
                      >
                        {t('cancelBtn')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(listing)}
                      className="w-full py-2 px-3 bg-white hover:bg-farm-50 text-farm-700 hover:text-farm-800 border border-farm-200 hover:border-farm-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t('editExpectedPriceBtn')}
                    </button>
                  </div>
                )}
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
