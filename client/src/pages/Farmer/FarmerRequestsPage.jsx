import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import { 
  Inbox, 
  Check, 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Layers, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const FarmerRequestsPage = ({ onNavigateOrders }) => {
  const { token } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(getApiUrl('/api/requests/farmer'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load requests.');
      }
      // ONLY pending requests
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [token]);

  // Handle Accept
  const handleAccept = async (requestId) => {
    if (!window.confirm(t('acceptConfirm'))) return;

    try {
      setActionLoadingId(requestId);
      setError('');
      setActionSuccess('');

      const res = await fetch(getApiUrl(`/api/requests/${requestId}/accept`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to accept request.');
      }

      // Immediately remove from pending requests view
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setActionSuccess(data.message || 'Request accepted and moved to My Orders.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject
  const handleReject = async (requestId) => {
    if (!window.confirm(t('rejectConfirm'))) return;

    try {
      setActionLoadingId(requestId);
      setError('');
      setActionSuccess('');

      const res = await fetch(getApiUrl(`/api/requests/${requestId}/reject`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reject request.');
      }

      // Immediately remove from pending requests view
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setActionSuccess(data.message || 'Request rejected and recorded in My Orders.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <Inbox className="w-7 h-7 text-amber-600" />
              {t('buyerRequestsTitle')}
            </h1>
            {requests.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                {requests.length} {t('pendingRequestsCount')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('buyerRequestsSubtitle')} &bull; Decided requests automatically move to My Orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPendingRequests}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNavigateOrders}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition"
          >
            {t('navMyOrders')} &rarr;
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">{t('loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {t('noPendingRequests')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            When buyers place purchase requests for your active crops, they will appear here for your review and approval.
          </p>
          <button
            onClick={onNavigateOrders}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition"
          >
            {t('viewOrdersAction')}
          </button>
        </div>
      )}

      {/* Pending Requests Cards */}
      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-amber-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Status & Date */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Decision
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(req.requestDate).toLocaleString()}
                  </span>
                </div>

                {/* Crop & Requested Quantity */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    {t('cropHeader')}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900">
                    {translateCrop(req.cropName)}
                  </h3>
                </div>

                {/* Calculation summary */}
                <div className="bg-amber-50/50 rounded-2xl p-4 mb-4 space-y-2 border border-amber-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{t('requestedQty')}:</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {req.requestedQuantity} {req.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{t('finalPricePerUnit')}:</span>
                    <span className="font-semibold text-gray-800">
                      ₹{req.finalPricePerUnit} / {req.unit}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 uppercase">{t('cropAmount')}:</span>
                    <span className="text-lg font-black text-amber-900">
                      ₹{req.cropAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Buyer Details */}
                <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('buyerNameLabel')}:</span>
                    <span className="font-bold text-gray-900">{req.buyerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {t('buyerPhoneLabel')}:
                    </span>
                    <a
                      href={`tel:${req.buyerPhone}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {req.buyerPhone}
                    </a>
                  </div>
                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-gray-500 block mb-0.5">{t('buyerLocationLabel')}:</span>
                    <span className="font-medium text-gray-800">
                      {req.buyerAddress}, {req.buyerVillageCity}, {req.buyerDistrict}, {req.buyerState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Accept & Reject */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleAccept(req.id)}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 text-xs sm:text-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {actionLoadingId === req.id ? t('accepting') : t('acceptBtn')}
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleReject(req.id)}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 text-xs sm:text-sm disabled:opacity-50"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  {actionLoadingId === req.id ? t('rejecting') : t('rejectBtn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
