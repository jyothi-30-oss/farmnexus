import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  IndianRupee, 
  Scale, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  ShoppingCart,
  Send,
  X
} from 'lucide-react';

export const BrowseCropsPage = ({ onNavigateOrders }) => {
  const { token } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Purchase modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [requiredQuantity, setRequiredQuantity] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [modalError, setModalError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(getApiUrl('/api/listings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch available crop listings.');
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

  // Open modal
  const handleOpenPurchaseModal = (listing) => {
    setSelectedListing(listing);
    setRequiredQuantity('');
    setModalError('');
  };

  // Submit purchase request: Buyer enters ONLY required quantity
  const handleSendPurchaseRequest = async (e) => {
    e.preventDefault();
    setModalError('');

    const numQuantity = Number(requiredQuantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setModalError('Quantity must be greater than zero.');
      return;
    }

    if (numQuantity > Number(selectedListing.availableQuantity)) {
      setModalError(
        `Quantity cannot exceed available quantity (${selectedListing.availableQuantity} ${selectedListing.unit}).`
      );
      return;
    }

    try {
      setSubmittingRequest(true);
      const res = await fetch(getApiUrl('/api/requests'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: selectedListing.id,
          requiredQuantity: numQuantity,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send purchase request.');
      }

      setSelectedListing(null);
      setRequestSuccess(t('requestSentSuccess'));
      setTimeout(() => {
        setRequestSuccess('');
      }, 5000);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filter listings strictly by crop name (matching exactly as entered)
  const filteredListings = listings.filter((l) => {
    const q = searchQuery.trim();
    if (!q) return true;
    const crop = l.cropName || '';
    const translated = translateCrop(l.cropName) || '';
    return crop.includes(q) || translated.includes(q);
  });

  // Calculate modal crop amount: Quantity × Final Price Per Unit
  const parsedModalQty = Number(requiredQuantity) || 0;
  const calculatedCropAmount = selectedListing
    ? parsedModalQty * Number(selectedListing.finalPricePerUnit)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <Search className="w-7 h-7 text-farm-600" />
            {t('browseCropsTitle')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('browseCropsSubtitle')}
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCropPlaceholder')}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={fetchListings}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {requestSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{requestSuccess}</span>
          </div>
          <button
            onClick={onNavigateOrders}
            className="text-xs font-bold text-emerald-900 underline hover:no-underline"
          >
            {t('navMyOrders')} &rarr;
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-10 h-10 border-4 border-farm-200 border-t-farm-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">{t('loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredListings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {searchQuery.trim() ? (t('noCropsFound') || 'No crops found') : t('noListingsAvailable')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery.trim()
              ? 'No crops match your search query. Try clearing the search filter.'
              : 'Farmers will list new harvest shortly. Check back frequently!'}
          </p>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Listings Grid */}
      {!loading && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 hover:border-farm-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Crop & Tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      {translateCrop(listing.cropName)}
                    </h3>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Listed {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    Available
                  </span>
                </div>

                {/* Pricing & Quantity Box */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 my-4 border border-emerald-100">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      {t('finalPricePerUnit')}:
                    </span>
                    <div>
                      <span className="text-2xl font-black text-emerald-800">
                        ₹{listing.finalPricePerUnit}
                      </span>
                      <span className="text-xs text-emerald-950 font-medium">
                        {' '}/ {listing.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-emerald-200/50">
                    <span>{t('availableQty')}:</span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {listing.availableQuantity} {listing.unit}
                    </span>
                  </div>
                </div>

                {/* Farmer Details & Phone Visibility */}
                <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Farmer:</span>
                    <span className="font-bold text-gray-900">{listing.farmerName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {t('farmerContact')}:
                    </span>
                    <a
                      href={`tel:${listing.farmerPhone}`}
                      className="font-bold text-farm-700 hover:underline"
                    >
                      {listing.farmerPhone}
                    </a>
                  </div>

                  <div className="pt-1 border-t border-gray-200 flex items-start gap-1 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {listing.village}, {listing.district}, {listing.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Request Button */}
              <button
                type="button"
                onClick={() => handleOpenPurchaseModal(listing)}
                className="w-full py-3 px-4 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {t('buyCropBtn')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Request Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 rounded-full bg-farm-100 text-farm-800 text-[10px] font-bold uppercase tracking-wider">
                Direct Purchase Request
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">
                {t('purchaseModalTitle')}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('purchaseModalSubtitle')}
              </p>
            </div>

            {modalError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Crop Info Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cropHeader')}:</span>
                <span className="font-bold text-gray-900 text-sm">
                  {translateCrop(selectedListing.cropName)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('finalPricePerUnit')}:</span>
                <span className="font-extrabold text-farm-800 text-sm">
                  ₹{selectedListing.finalPricePerUnit} / {selectedListing.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('maxAvailable')}:</span>
                <span className="font-semibold text-gray-800">
                  {selectedListing.availableQuantity} {selectedListing.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="text-gray-500">Farmer:</span>
                <span className="font-semibold text-gray-800">
                  {selectedListing.farmerName} ({selectedListing.farmerPhone})
                </span>
              </div>
            </div>

            {/* Buyer Form: REQUIRED QUANTITY ONLY */}
            <form onSubmit={handleSendPurchaseRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('enterRequiredQty')} ({selectedListing.unit}) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="0.01"
                    max={selectedListing.availableQuantity}
                    step="any"
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(e.target.value)}
                    placeholder={`e.g. ${Math.min(100, selectedListing.availableQuantity)}`}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                    required
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {t('maxAvailable')}: {selectedListing.availableQuantity} {selectedListing.unit}
                </span>
              </div>

              {/* Automatic Amount Calculation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-farm-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-farm-800 block">
                  {t('calculatedCropAmount')} (Quantity &times; Final Price)
                </span>
                <div className="text-2xl font-black text-farm-900 mt-1">
                  ₹{calculatedCropAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {parsedModalQty} {selectedListing.unit} &times; ₹{selectedListing.finalPricePerUnit}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingRequest || parsedModalQty <= 0}
                  className="flex-1 py-3 px-4 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  {submittingRequest ? t('sendingRequest') : t('sendRequestBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition"
                >
                  {t('cancelBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
