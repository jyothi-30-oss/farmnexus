import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  IndianRupee, 
  Plus, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const FarmerOrdersPage = () => {
  const { token } = useAuth();
  const { t, translateCrop } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delivery charge modal state
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [deliveryChargeInput, setDeliveryChargeInput] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Status updating state
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(getApiUrl('/api/orders/farmer'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load orders.');
      }
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Open delivery charge modal
  const openDeliveryModal = (order) => {
    setEditingOrderId(order.id);
    setDeliveryChargeInput(order.deliveryCharge !== undefined ? String(order.deliveryCharge) : '0');
  };

  // Submit delivery charge update
  const handleSaveDeliveryCharge = async (e) => {
    e.preventDefault();
    const charge = Number(deliveryChargeInput);
    if (isNaN(charge) || charge < 0) {
      setError('Please enter a valid non-negative delivery charge.');
      return;
    }

    try {
      setSubmittingDelivery(true);
      setError('');
      setSuccess('');

      const res = await fetch(getApiUrl(`/api/orders/${editingOrderId}/delivery-charge`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryCharge: charge }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update delivery charge.');
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrderId ? data.order : o))
      );
      setEditingOrderId(null);
      setSuccess('Delivery charge updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingDelivery(false);
    }
  };

  // Update order status: ACCEPTED -> READY -> SHIPPED -> DELIVERED
  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      setStatusUpdatingId(orderId);
      setError('');
      setSuccess('');

      const res = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status.');
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
      setSuccess(`Order marked as ${nextStatus}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
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
            <ShoppingBag className="w-7 h-7 text-farm-600" />
            {t('farmerOrdersTitle')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('farmerOrdersSubtitle')}
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
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
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {t('noOrdersYet')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Once you accept or reject purchase requests from buyers, they will appear here with complete fulfilment and delivery tracking.
          </p>
        </div>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => {
            const isRejected = order.status === 'REJECTED';
            const cropAmt = Number(order.cropAmount) || 0;
            const deliveryAmt = Number(order.deliveryCharge) || 0;
            const totalAmt = Number(order.totalAmount) || cropAmt + deliveryAmt;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition ${
                  isRejected ? 'border-rose-100 bg-rose-50/20' : 'border-gray-100 hover:border-farm-300'
                }`}
              >
                {/* Header: Status badge & Order Date */}
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                  {/* Column 1: Crop & Quantity */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {t('cropHeader')}
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                      {translateCrop(order.cropName)}
                    </h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-bold text-base text-farm-900">
                        {order.quantity} {order.unit}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        @ ₹{order.finalPricePerUnit} / {order.unit}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Financial Calculation */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('cropAmount')}:</span>
                      <span className="font-bold text-gray-900">
                        ₹{cropAmt.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">{t('deliveryCharge')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          ₹{deliveryAmt.toLocaleString('en-IN')}
                        </span>
                        {!isRejected && (
                          <button
                            type="button"
                            onClick={() => openDeliveryModal(order)}
                            className="text-[11px] font-bold text-farm-700 hover:text-farm-900 underline"
                          >
                            {deliveryAmt > 0 ? t('updateDeliveryChargeBtn') : t('addDeliveryChargeBtn')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-900 uppercase">{t('totalAmount')}:</span>
                      <span className="text-base font-black text-farm-800">
                        ₹{totalAmt.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Buyer Details */}
                  <div className="text-xs space-y-1.5 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Buyer Details
                    </span>
                    <div className="font-bold text-gray-900 text-sm">{order.buyerName}</div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Phone className="w-3.5 h-3.5" />
                      <a href={`tel:${order.buyerPhone}`} className="hover:underline font-semibold">
                        {order.buyerPhone}
                      </a>
                    </div>
                    <div className="text-gray-600 flex items-start gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>
                        {order.buyerAddress}, {order.buyerVillageCity}, {order.buyerDistrict}, {order.buyerState}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions Flow */}
                {/* Accepted -> Ready -> Shipped -> Delivered */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  {isRejected ? (
                    <p className="text-xs text-rose-700 italic flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      {t('rejectedNote')}
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">
                        Status Actions:
                      </span>

                      {order.status === 'ACCEPTED' && (
                        <button
                          type="button"
                          disabled={statusUpdatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Package className="w-3.5 h-3.5" />
                          {t('markReadyBtn')} &rarr;
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          type="button"
                          disabled={statusUpdatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          {t('markShippedBtn')} &rarr;
                        </button>
                      )}

                      {order.status === 'SHIPPED' && (
                        <button
                          type="button"
                          disabled={statusUpdatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('markDeliveredBtn')} &check;
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Order fulfilled & delivered successfully.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delivery Charge Modal */}
      {editingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-farm-600" />
              {t('addDeliveryChargeBtn')}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Delivery charge is added to the crop amount. Total Amount = Crop Amount + Delivery Charge.
            </p>

            <form onSubmit={handleSaveDeliveryCharge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t('deliveryCharge')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={deliveryChargeInput}
                    onChange={(e) => setDeliveryChargeInput(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="flex-1 py-2.5 bg-farm-600 hover:bg-farm-700 text-white font-bold rounded-xl text-xs shadow transition disabled:opacity-50"
                >
                  {submittingDelivery ? t('saving') : 'Save Delivery Charge'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOrderId(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
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
