

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscriptionAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiCheck, HiX, HiEye, HiRefresh, HiSearch, HiClock, HiCheckCircle, HiXCircle, HiCash, HiUser, HiExclamation, HiPhotograph, HiFilter, HiInformationCircle, HiPlus, HiPencil, HiTrash, HiCube, HiStar, HiOfficeBuilding, HiTrendingUp } from 'react-icons/hi';

const planIcons = [HiCube, HiStar, HiOfficeBuilding, HiTrendingUp];
const planColors = ['bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700'];

const defaultFeatures = {
  free: ['Up to 1 restaurant', 'Up to 5 tables', 'Up to 3 menus', 'Basic support', 'Standard listing'],
  basic: ['Up to 3 restaurants', 'Up to 15 tables', 'Up to 10 menus', 'Email support', 'Basic analytics', 'Menu management'],
  premium: ['Up to 10 restaurants', 'Unlimited tables', 'Unlimited menus', 'Priority support', 'Full analytics', 'Featured listing', 'Advanced reporting'],
  enterprise: ['Unlimited restaurants', 'Multi-branch support', 'Unlimited menus', 'Dedicated support', 'Custom integrations', 'API access', 'Priority listing', 'White-label option'],
};

const AdminSubscriptions = () => {
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '', price: '', duration: 30, features: '', maxRestaurants: 1, maxTables: 5, maxMenus: 3,
    analyticsEnabled: false, prioritySupport: false, featuredListing: false, apiAccess: false,
  });
  const [processing, setProcessing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const [paymentsRes, subsRes, plansRes] = await Promise.all([
        subscriptionAPI.getPendingPayments(params),
        subscriptionAPI.getAllSubscriptions(),
        subscriptionAPI.getPlans(),
      ]);
      setPayments(paymentsRes.data.data || []);
      setSubscriptions(subsRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleSavePlan = async () => {
    if (!planForm.name || !planForm.price) {
      Swal.fire({ icon: 'error', title: 'Name and price are required' });
      return;
    }
    try {
      const data = {
        name: planForm.name,
        price: parseFloat(planForm.price),
        duration: parseInt(planForm.duration) || 30,
        features: planForm.features.split(',').map(f => f.trim()).filter(Boolean),
        maxRestaurants: parseInt(planForm.maxRestaurants) || 1,
        maxTables: parseInt(planForm.maxTables) || 5,
        maxMenus: parseInt(planForm.maxMenus) || 3,
        analyticsEnabled: planForm.analyticsEnabled,
        prioritySupport: planForm.prioritySupport,
        featuredListing: planForm.featuredListing,
        apiAccess: planForm.apiAccess,
      };
      if (editingPlan) {
        await subscriptionAPI.updatePlan(editingPlan._id, data);
        Swal.fire({ icon: 'success', title: 'Plan updated!' });
      } else {
        await subscriptionAPI.createPlan(data);
        Swal.fire({ icon: 'success', title: 'Plan created!' });
      }
      setShowPlanModal(false);
      setEditingPlan(null);
      setPlanForm({ name: '', price: '', duration: 30, features: '', maxRestaurants: 1, maxTables: 5, maxMenus: 3, analyticsEnabled: false, prioritySupport: false, featuredListing: false, apiAccess: false });
      await fetchData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to save plan' });
    }
  };

  const handleDeletePlan = async (planId) => {
    const result = await Swal.fire({ title: 'Delete Plan?', text: 'This cannot be undone', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
    if (!result.isConfirmed) return;
    try {
      await subscriptionAPI.deletePlan(planId);
      Swal.fire({ icon: 'success', title: 'Plan deleted' });
      await fetchData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to delete' });
    }
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name, price: plan.price, duration: plan.duration || 30,
      features: (plan.features || []).join(', '), maxRestaurants: plan.maxRestaurants || 1,
      maxTables: plan.maxTables || 5, maxMenus: plan.maxMenus || 3,
      analyticsEnabled: plan.analyticsEnabled || false, prioritySupport: plan.prioritySupport || false,
      featuredListing: plan.featuredListing || false, apiAccess: plan.apiAccess || false,
    });
    setShowPlanModal(true);
  };

  const handleApprove = async (payment) => {
    const result = await Swal.fire({
      title: 'Approve Payment?',
      text: `This will activate the ${payment.plan?.name} subscription for ${payment.user?.name}`,
      icon: 'question',
      input: 'textarea',
      inputPlaceholder: 'Optional admin note...',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      confirmButtonText: 'Yes, Approve & Activate',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setProcessing(payment._id);
    try {
      await subscriptionAPI.approvePayment(payment._id, result.value || '');
      Swal.fire({ icon: 'success', title: 'Payment Approved', text: 'Subscription has been activated!' });
      await fetchData();
      setSelectedPayment(null);
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to approve' });
    } finally { setProcessing(null); }
  };

  const handleReject = async (payment) => {
    const result = await Swal.fire({
      title: 'Reject Payment?',
      text: 'Provide a reason for rejection',
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Rejection reason...',
      inputValidator: (value) => { if (!value) return 'Reason is required'; },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setProcessing(payment._id);
    try {
      await subscriptionAPI.rejectPayment(payment._id, result.value);
      Swal.fire({ icon: 'success', title: 'Payment Rejected', text: 'User will be notified.' });
      await fetchData();
      setSelectedPayment(null);
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to reject' });
    } finally { setProcessing(null); }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: HiClock },
      approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: HiCheckCircle },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: HiXCircle },
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: HiCheckCircle },
      expired: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', icon: HiX },
      suspended: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: HiExclamation },
    };
    const c = config[status] || config.pending;
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label || status}</span>;
  };

  const filteredPayments = payments.filter(p => {
    if (activeTab === 'pending' && p.status !== 'pending') return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'approved' && p.status !== 'approved') return false;
    if (activeTab === 'rejected' && p.status !== 'rejected') return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Verification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and verify subscription payments</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
          <HiRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {[
          { key: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
          { key: 'approved', label: 'Approved', count: payments.filter(p => p.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: payments.filter(p => p.status === 'rejected').length },
          { key: 'plans', label: 'Plans', count: plans.length },
          { key: 'all', label: 'All Payments', count: payments.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === tab.key ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            }`}>{tab.count}</span>
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID or sender number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40 text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={fetchData} className="btn-secondary text-sm py-2.5">
          <HiFilter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Subscription Plans</h3>
            <button onClick={() => { setEditingPlan(null); setPlanForm({ name: '', price: '', duration: 30, features: '', maxRestaurants: 1, maxTables: 5, maxMenus: 3, analyticsEnabled: false, prioritySupport: false, featuredListing: false, apiAccess: false }); setShowPlanModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
              <HiPlus className="w-4 h-4" /> Add Plan
            </button>
          </div>
          {plans.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <HiCube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No plans created yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first subscription plan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan, idx) => {
                const Icon = planIcons[idx] || HiCube;
                return (
                  <div key={plan._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 relative group hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${planColors[idx]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditPlan(plan)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit"><HiPencil className="w-4 h-4 text-blue-500" /></button>
                        <button onClick={() => handleDeletePlan(plan._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Delete"><HiTrash className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{plan.name}</h4>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-purple-600">৳{plan.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">/{plan.duration}d</span>
                    </div>
                    <ul className="space-y-1.5 mt-3">
                      {(plan.features || []).slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <HiCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />{f}
                        </li>
                      ))}
                      {(plan.features || []).length > 3 && <li className="text-xs text-gray-400">+{plan.features.length - 3} more</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payments List (non-plan tabs) */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <HiCash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No payments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all ${
                payment.status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' :
                payment.status === 'approved' ? 'border-green-200 dark:border-green-800' :
                'border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <HiUser className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{payment.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{payment.user?.email}</p>
                      <p className="text-xs text-gray-400">{payment.user?.phone}</p>
                    </div>
                  </div>

                  {/* Plan Info */}
                  <div className="text-center lg:text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.plan?.name || 'N/A'} Plan</p>
                    <p className="text-lg font-bold text-purple-600">৳{payment.amount?.toLocaleString()}</p>
                  </div>

                  {/* Transaction Info */}
                  <div className="text-sm">
                    <p className="text-gray-500 dark:text-gray-400">TX: <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{payment.transactionId}</span></p>
                    <p className="text-gray-500 dark:text-gray-400">Method: <span className="font-medium text-gray-900 dark:text-gray-100 uppercase">{payment.method}</span></p>
                    <p className="text-gray-500 dark:text-gray-400">From: <span className="font-medium text-gray-900 dark:text-gray-100">{payment.senderNumber}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(payment.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(payment.status)}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPayment(selectedPayment?._id === payment._id ? null : payment)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment)}
                            disabled={processing === payment._id}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                          >
                            {processing === payment._id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(payment)}
                            disabled={processing === payment._id}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedPayment?._id === payment._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Details</h4>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-gray-500">Transaction ID: <span className="text-gray-900 dark:text-gray-100 font-mono">{payment.transactionId}</span></p>
                              <p className="text-gray-500">Method: <span className="text-gray-900 dark:text-gray-100 uppercase">{payment.method}</span></p>
                              <p className="text-gray-500">Sender: <span className="text-gray-900 dark:text-gray-100">{payment.senderNumber}</span></p>
                              <p className="text-gray-500">Amount: <span className="text-gray-900 dark:text-gray-100">৳{payment.amount?.toLocaleString()}</span></p>
                              <p className="text-gray-500">Submitted: <span className="text-gray-900 dark:text-gray-100">{new Date(payment.createdAt).toLocaleString()}</span></p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">User Info</h4>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-gray-500">Name: <span className="text-gray-900 dark:text-gray-100">{payment.user?.name}</span></p>
                              <p className="text-gray-500">Email: <span className="text-gray-900 dark:text-gray-100">{payment.user?.email}</span></p>
                              <p className="text-gray-500">Phone: <span className="text-gray-900 dark:text-gray-100">{payment.user?.phone || 'N/A'}</span></p>
                            </div>
                            {payment.screenshot && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Screenshot</p>
                                <a href={payment.screenshot} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                                  <HiPhotograph className="w-4 h-4" /> View Screenshot
                                </a>
                              </div>
                            )}
                            {payment.adminNote && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Note</p>
                                <p className="text-sm text-gray-500">{payment.adminNote}</p>
                              </div>
                            )}
                            {payment.reviewedBy && (
                              <p className="text-xs text-gray-400 mt-2">Reviewed by: {payment.reviewedBy?.name} on {payment.reviewedAt ? new Date(payment.reviewedAt).toLocaleString() : 'N/A'}</p>
                            )}
                          </div>
                        </div>
                      </div>
            </motion.div>
        )}
      </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Subscription Management */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Manage Active Subscriptions</h3>
          <p className="text-sm text-gray-500">Suspend, extend, or manage user subscriptions</p>
        </div>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <HiCube className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left p-4 font-medium text-gray-500">Owner</th>
                  <th className="text-left p-4 font-medium text-gray-500">Plan</th>
                  <th className="text-left p-4 font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500">Duration</th>
                  <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sub.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{sub.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{sub.plan?.name || 'N/A'}</span>
                      {sub.plan?.price > 0 && <p className="text-xs text-purple-600">৳{sub.plan.price.toLocaleString()}</p>}
                    </td>
                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                    <td className="p-4 text-sm">
                      {sub.startDate && <p className="text-gray-500">Start: {new Date(sub.startDate).toLocaleDateString()}</p>}
                      {sub.endDate && <p className="text-xs text-gray-400">End: {new Date(sub.endDate).toLocaleDateString()}</p>}
                      {!sub.startDate && <span className="text-gray-400">Not activated</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {sub.status === 'active' && (
                          <button
                            onClick={async () => {
                              const { value: reason } = await Swal.fire({ title: 'Suspend Subscription', input: 'textarea', inputPlaceholder: 'Reason for suspension...', inputValidator: (v) => { if (!v) return 'Reason is required'; }, showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Suspend' });
                              if (!reason) return;
                              try {
                                await subscriptionAPI.suspendSubscription(sub._id, reason);
                                Swal.fire({ icon: 'success', title: 'Subscription suspended' });
                                fetchData();
                              } catch (err) { Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed' }); }
                            }}
                            className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                          >Suspend</button>
                        )}
                        {sub.status === 'suspended' && (
                          <button
                            onClick={async () => {
                              try {
                                await subscriptionAPI.updateSubscriptionStatus(sub._id, 'active');
                                Swal.fire({ icon: 'success', title: 'Subscription reactivated' });
                                fetchData();
                              } catch (err) { Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed' }); }
                            }}
                            className="px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                          >Activate</button>
                        )}
                        <button
                          onClick={async () => {
                            const { value: days } = await Swal.fire({ title: 'Extend Subscription', text: 'How many days to add?', input: 'number', inputValue: 30, showCancelButton: true, confirmButtonColor: '#8b5cf6', confirmButtonText: 'Extend' });
                            if (!days || days < 1) return;
                            try {
                              await subscriptionAPI.extendSubscription(sub._id, parseInt(days));
                              Swal.fire({ icon: 'success', title: `Extended by ${days} days` });
                              fetchData();
                            } catch (err) { Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed' }); }
                          }}
                          className="px-2.5 py-1 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors"
                        >Extend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowPlanModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                    <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><HiX className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Plan Name *</label>
                      <input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="input-field" placeholder="e.g. Premium" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (BDT) *</label>
                        <input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} className="input-field" placeholder="0" min="0" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (days) *</label>
                        <input type="number" value={planForm.duration} onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })} className="input-field" placeholder="30" min="1" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Features (comma separated)</label>
                      <textarea value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} className="input-field" placeholder="Up to 10 restaurants, Priority support, Full analytics" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Restaurants</label>
                        <input type="number" value={planForm.maxRestaurants} onChange={(e) => setPlanForm({ ...planForm, maxRestaurants: e.target.value })} className="input-field" min="1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Tables</label>
                        <input type="number" value={planForm.maxTables} onChange={(e) => setPlanForm({ ...planForm, maxTables: e.target.value })} className="input-field" min="1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Menus</label>
                        <input type="number" value={planForm.maxMenus} onChange={(e) => setPlanForm({ ...planForm, maxMenus: e.target.value })} className="input-field" min="1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
                      {[
                        { key: 'analyticsEnabled', label: 'Analytics Enabled' },
                        { key: 'prioritySupport', label: 'Priority Support' },
                        { key: 'featuredListing', label: 'Featured Listing' },
                        { key: 'apiAccess', label: 'API Access' },
                      ].map((opt) => (
                        <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={planForm[opt.key]} onChange={(e) => setPlanForm({ ...planForm, [opt.key]: e.target.checked })} className="rounded border-gray-300 text-purple-500 focus:ring-purple-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={() => setShowPlanModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                      <button onClick={handleSavePlan} className="btn-primary flex-[2] py-3">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Subscription Stats */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Subscription Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active', count: subscriptions.filter(s => s.status === 'active').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Pending', count: subscriptions.filter(s => s.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'Expired', count: subscriptions.filter(s => s.status === 'expired').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Suspended', count: subscriptions.filter(s => s.status === 'suspended').length, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
