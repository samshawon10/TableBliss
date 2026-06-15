

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscriptionAPI } from '../../services/api';
import { HiCheck, HiCube, HiStar, HiOfficeBuilding, HiTrendingUp, HiCash, HiClock, HiCheckCircle, HiXCircle, HiArrowRight, HiUpload, HiPhotograph, HiInformationCircle, HiShieldCheck, HiExclamation, HiRefresh } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const planIcons = [HiCube, HiStar, HiOfficeBuilding, HiTrendingUp];
const planColors = ['bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700'];
const planBorderColors = ['border-gray-200', 'border-blue-300', 'border-purple-500', 'border-yellow-400'];

const PAYMENT_INFO = {
  bkash: { name: 'bKash', number: '01XXXXXXXXX', accountName: 'TableBliss Admin', logo: '📱' },
  nagad: { name: 'Nagad', number: '01XXXXXXXXX', accountName: 'TableBliss Admin', logo: '📱' },
  rocket: { name: 'Rocket', number: '01XXXXXXXXX', accountName: 'TableBliss Admin', logo: '🚀' },
};

const OwnerSubscription = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [selectingPlan, setSelectingPlan] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    method: 'bkash',
    senderNumber: '',
    amount: '',
    screenshot: '',
  });
  const [activeTab, setActiveTab] = useState('plans');
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, paymentsRes] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getMySubscription(),
        subscriptionAPI.getMyPayments(),
      ]);
      setPlans(plansRes.data.data || []);
      setSubscription(subRes.data.data);
      setPayments(paymentsRes.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) {
      setSelectingPlan(plan._id);
      try {
        const res = await subscriptionAPI.selectPlan(plan._id);
        Swal.fire({ icon: 'success', title: res.data.message || 'Free plan activated!' });
        await fetchData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to select plan' });
      } finally { setSelectingPlan(null); }
      return;
    }

    // Paid plan: select plan and show payment form
    setSelectingPlan(plan._id);
    try {
      const res = await subscriptionAPI.selectPlan(plan._id);
      setSelectedPlan({ ...plan, subscriptionId: res.data.data._id });
      setPaymentForm(prev => ({ ...prev, amount: plan.price.toString() }));
      setShowPaymentForm(true);
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to select plan' });
    } finally {
      setSelectingPlan(null);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!paymentForm.transactionId.trim()) {
      setError('Transaction ID is required');
      return;
    }
    if (!paymentForm.senderNumber.trim()) {
      setError('Sender number is required');
      return;
    }
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Valid amount is required');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await subscriptionAPI.submitPayment({
        subscriptionId: selectedPlan.subscriptionId,
        transactionId: paymentForm.transactionId.trim(),
        method: paymentForm.method,
        senderNumber: paymentForm.senderNumber.trim(),
        amount: parseFloat(paymentForm.amount),
        screenshot: paymentForm.screenshot || '',
      });

      Swal.fire({ icon: 'success', title: 'Payment submitted!', text: 'Awaiting admin verification.' });
      setShowPaymentForm(false);
      setSelectedPlan(null);
      setPaymentForm({ transactionId: '', method: 'bkash', senderNumber: '', amount: '', screenshot: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Active' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
      expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Expired' },
      suspended: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Suspended' },
      cancelled: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: 'Cancelled' },
      approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Approved' },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Rejected' },
    };
    const c = config[status] || config.pending;
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (loading) return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const currentSub = subscription?.current;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Subscription Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your plan and payments</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <HiRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Current Subscription Banner */}
        {currentSub && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm opacity-90">Current Plan</p>
                <h2 className="text-2xl font-bold">{currentSub.plan?.name || 'N/A'}</h2>
                <p className="text-sm opacity-80 mt-1">
                  Status: {currentSub.status} · {currentSub.startDate ? `Started ${new Date(currentSub.startDate).toLocaleDateString()}` : ''}
                </p>
                {currentSub.endDate && (
                  <p className="text-xs opacity-70 mt-0.5">Expires: {new Date(currentSub.endDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">৳{currentSub.plan?.price?.toLocaleString() || '0'}<span className="text-sm opacity-80">/mo</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {[
            { key: 'plans', label: 'Plans' },
            { key: 'payments', label: `Payments (${payments.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === tab.key ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan, idx) => {
                  const Icon = planIcons[idx] || HiCube;
                  const isCurrent = currentSub?.plan?._id === plan._id;
                  const isSelectedPlan = selectedPlan?._id === plan._id;

                  return (
                    <div key={plan._id} className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${isCurrent ? 'border-purple-500 shadow-lg shadow-purple-200 dark:shadow-purple-900/20' : planBorderColors[idx]} overflow-hidden relative transition-all duration-200 hover:shadow-lg`}>
                      {plan.name === 'Premium' && <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-center text-xs font-bold py-1">MOST POPULAR</div>}
                      {isCurrent && <div className="bg-purple-500 text-white text-center text-xs font-bold py-1">CURRENT PLAN</div>}

                      <div className="p-6">
                        <div className={`w-14 h-14 rounded-xl ${planColors[idx]} flex items-center justify-center mb-4`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-purple-600">৳{plan.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">/mo</span>
                        </div>
                        <ul className="space-y-3 mt-6">
                          {plan.features?.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <HiCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isCurrent || selectingPlan === plan._id}
                          className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all ${
                            isCurrent ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' :
                            selectingPlan === plan._id ? 'bg-purple-300 text-white cursor-wait' :
                            plan.name === 'Premium' ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-md' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}>
                          {selectingPlan === plan._id ? 'Processing...' : isCurrent ? 'Current Plan' : plan.price === 0 ? 'Activate Free' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <HiCash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No payment history</p>
                  <p className="text-sm text-gray-400 mt-1">Select a plan to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
                            payment.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                            payment.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20' :
                            'bg-yellow-100 dark:bg-yellow-900/20'
                          }`}>
                            {payment.status === 'approved' ? <HiCheckCircle className="w-6 h-6 text-green-600" /> :
                             payment.status === 'rejected' ? <HiXCircle className="w-6 h-6 text-red-600" /> :
                             <HiClock className="w-6 h-6 text-yellow-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{payment.plan?.name} Plan</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.method.toUpperCase()} · {payment.transactionId}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(payment.createdAt).toLocaleDateString()} · ৳{payment.amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(payment.status)}
                          {payment.adminNote && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">{payment.adminNote}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Form Modal */}
        <AnimatePresence>
          {showPaymentForm && selectedPlan && (
            <>
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => { if (!submittingPayment) { setShowPaymentForm(false); setError(''); } }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Complete Payment</h3>
                      <button onClick={() => { if (!submittingPayment) { setShowPaymentForm(false); setError(''); } }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <HiXCircle className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Plan Summary */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6 border border-purple-100 dark:border-purple-800/30">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Selected Plan</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedPlan.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount: ৳{selectedPlan.price?.toLocaleString()}</p>
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6 border border-yellow-100 dark:border-yellow-800/30">
                      <div className="flex items-start gap-3">
                        <HiInformationCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Payment Instructions</p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Send the exact amount to any of the following numbers and submit the transaction details below.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods Info */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {Object.entries(PAYMENT_INFO).map(([key, info]) => (
                        <div key={key} className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentForm.method === key
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`} onClick={() => setPaymentForm({ ...paymentForm, method: key })}>
                          <div className="text-2xl mb-1">{info.logo}</div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{info.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{info.number}</p>
                        </div>
                      ))}
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method *</label>
                        <select
                          value={paymentForm.method}
                          onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                          className="input-field"
                          required
                        >
                          <option value="bkash">bKash</option>
                          <option value="nagad">Nagad</option>
                          <option value="rocket">Rocket</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transaction ID *</label>
                        <input
                          type="text"
                          value={paymentForm.transactionId}
                          onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                          className="input-field"
                          placeholder="e.g. TRX123ABC"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the transaction ID from your mobile banking app</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sender Number *</label>
                        <input
                          type="text"
                          value={paymentForm.senderNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, senderNumber: e.target.value })}
                          className="input-field"
                          placeholder="e.g. 01XXXXXXXXX"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (BDT) *</label>
                        <input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          className="input-field"
                          placeholder="Amount"
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Screenshot (optional)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={paymentForm.screenshot}
                            onChange={(e) => setPaymentForm({ ...paymentForm, screenshot: e.target.value })}
                            className="input-field"
                            placeholder="Paste image URL (optional)"
                          />
                          <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <HiPhotograph className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Upload screenshot to a hosting service and paste the URL</p>
                      </div>

                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                          {error}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                        <HiShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                        <span>Your payment information is secure. Admin will verify the transaction manually.</span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowPaymentForm(false); setError(''); }}
                          disabled={submittingPayment}
                          className="btn-secondary flex-1 py-3"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingPayment}
                          className="btn-primary flex-[2] py-3 disabled:opacity-50"
                        >
                          {submittingPayment ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </span>
                          ) : 'Submit Payment'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OwnerSubscription;
