import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle2, 
  Package, 
  Clock, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Search
} from 'lucide-react';

export const BuyerOrdersPage = ({ onNavigateBrowse }) => {
  const { token } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [ordersRes, requestsRes] = await Promise.all([
        fetch(getApiUrl('/api/orders/buyer'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(getApiUrl('/api/requests/buyer'), { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const ordersData = await ordersRes.json();
      const requestsData = await requestsRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
      if (requestsData.success) {
        // Filter pending requests only (requests not yet turned into orders)
        setPendingRequests((requestsData.requests || []).filter((r) => r.status === 'PENDING'));
      }
    } catch (err) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('statusAccepted')}
          </span>
        );
      case 'READY':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {t('statusReady')}
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {t('statusShipped')}
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('statusDelivered')}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            {t('statusRejected')}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
            {t('buyerOrdersTitle')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('buyerOrdersSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNavigateBrowse}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            {t('browseCropsAction')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">{t('loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && pendingRequests.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {t('noBuyerOrders')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Browse available crops listed by farmers and send purchase requests directly.
          </p>
          <button
            onClick={onNavigateBrowse}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {t('browseCropsAction')}
          </button>
        </div>
      )}

      {/* Section 1: Pending Purchase Requests Awaiting Farmer Approval */}
      {!loading && pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Requests Pending Farmer Review ({pendingRequests.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                    Awaiting Decision
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(req.requestDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-black text-gray-900">
                  {translateCrop(req.cropName)}
                </h3>

                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requested:</span>
                    <span className="font-bold text-gray-800">
                      {req.requestedQuantity} {req.unit} @ ₹{req.finalPricePerUnit}/{req.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cropAmount')}:</span>
                    <span className="font-bold text-amber-900">
                      ₹{req.cropAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-200/50">
                    <span className="text-gray-500">Farmer:</span>
                    <span className="font-semibold text-gray-700">
                      {req.farmerName} ({req.farmerPhone})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Decided Orders (Accepted & Rejected) */}
      {!loading && orders.length > 0 && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            Fulfilment Orders ({orders.length})
          </h2>

          <div className="space-y-4">
            {orders.map((order) => {
              const isRejected = order.status === 'REJECTED';
              const cropAmt = Number(order.cropAmount) || 0;
              const deliveryAmt = Number(order.deliveryCharge) || 0;
              const totalAmt = Number(order.totalAmount) || cropAmt + deliveryAmt;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border transition ${
                    isRejected ? 'border-rose-100 bg-rose-50/20' : 'border-gray-100 hover:border-blue-300'
                  }`}
                >
                  {/* Top Bar: Status badge & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-400 font-mono">
                        #{order.id.substring(0, 10)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.orderDate).toLocaleString()}
                    </span>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                    {/* Crop & Quantity */}
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        {t('cropHeader')}
                      </span>
                      <h3 className="text-2xl font-extrabold text-gray-900">
                        {translateCrop(order.cropName)}
                      </h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-bold text-base text-blue-900">
                          {order.quantity} {order.unit}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          @ ₹{order.finalPricePerUnit} / {order.unit}
                        </span>
                      </div>
                    </div>

                    {/* Financial Breakdown (Read-Only for Buyer) */}
                    <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('cropAmount')}:</span>
                        <span className="font-bold text-gray-900">
                          ₹{cropAmt.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">{t('deliveryCharge')}:</span>
                        <span className="font-bold text-gray-900">
                          ₹{deliveryAmt.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-900 uppercase block">{t('totalAmount')}:</span>
                          <span className="text-[10px] text-gray-400">({t('totalFormula')})</span>
                        </div>
                        <span className="text-lg font-black text-blue-900">
                          ₹{totalAmt.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Farmer Details (Phone Visible) */}
                    <div className="text-xs space-y-1.5 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        {t('farmerDetails')}
                      </span>
                      <div className="font-bold text-gray-900 text-sm">{order.farmerName}</div>
                      <div className="flex items-center gap-1.5 text-farm-700">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${order.farmerPhone}`} className="hover:underline font-semibold">
                          {order.farmerPhone}
                        </a>
                      </div>
                      <div className="text-gray-600 flex items-start gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>
                          {order.farmerVillage}, {order.farmerDistrict}, {order.farmerState}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Note */}
                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                    {order.status === 'ACCEPTED' && (
                      <span className="text-blue-700 font-medium">
                        Order accepted by farmer. Awaiting preparation for dispatch.
                      </span>
                    )}
                    {order.status === 'READY' && (
                      <span className="text-amber-700 font-medium">
                        Order is packaged and ready for dispatch.
                      </span>
                    )}
                    {order.status === 'SHIPPED' && (
                      <span className="text-purple-700 font-medium">
                        Order has been dispatched and is currently in transit.
                      </span>
                    )}
                    {order.status === 'DELIVERED' && (
                      <span className="text-emerald-700 font-bold">
                        Order delivered successfully.
                      </span>
                    )}
                    {order.status === 'REJECTED' && (
                      <span className="text-rose-700 font-medium">
                        This purchase request was rejected by the farmer.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
