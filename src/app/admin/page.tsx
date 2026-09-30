"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SURAT_AREAS } from '@/lib/mockData';
import { 
  ShieldAlert, 
  UserPlus, 
  Building2, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Plus, 
  Check, 
  X, 
  Layers, 
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { Ground, TurfType } from '@/types';

export default function AdminCenterPage() {
  const { 
    currentUser, 
    grounds, 
    addGround, 
    toggleGroundStatus, 
    bookings, 
    auditLogs, 
    ledger, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ONBOARD' | 'GROUNDS' | 'AUDIT_LOGS' | 'METRICS'>('GROUNDS');
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Form: Onboard Ground on behalf of owner
  const [ownerPhone, setOwnerPhone] = useState('9825199999');
  const [ownerName, setOwnerName] = useState('Dharmesh Patel');
  const [groundName, setGroundName] = useState('');
  const [groundArea, setGroundArea] = useState('Mota Varachha');
  const [groundAddress, setGroundAddress] = useState('Near Abrama Road, Mota Varachha, Surat');
  const [groundPhone, setGroundPhone] = useState('9825199999');
  const [boxName, setBoxName] = useState('Box A (360 Netting)');
  const [boxType, setBoxType] = useState<TurfType>('THREE_SIXTY');
  const [boxPrice, setBoxPrice] = useState(850);
  const [ownerUpi, setOwnerUpi] = useState('dharmeshbox@okaxis');

  // Stats
  const totalGMV = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalCommission = Math.round((totalGMV * 5) / 100);

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groundName.trim()) return;

    addGround({
      ownerId: `user_owner_${Date.now()}`,
      ownerName,
      ownerPhone,
      name: groundName.trim(),
      description: `Premium box cricket turf in ${groundArea}, Surat with high-density grass carpet and night floodlights.`,
      phone: groundPhone,
      addressLine: groundAddress,
      area: groundArea,
      city: 'Surat',
      state: 'Gujarat',
      pincode: '394101',
      lat: 21.24,
      lng: 72.88,
      amenities: ['Night Floodlights', 'Pavilion Dugout', 'RO Drinking Water', 'Parking'],
      status: 'VERIFIED',
      createdByAdminId: currentUser.id,
      images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000'],
      boxes: [
        {
          id: `box_${Date.now()}`,
          groundId: '',
          name: boxName,
          type: boxType,
          widthFt: 100,
          heightFt: 40,
          maxPlayers: 14,
          basePrice: boxPrice,
          slotMinutes: 60,
          images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'],
          isActive: true,
          schedules: [
            { dayOfWeek: 1, openTime: '06:00', closeTime: '02:00', pricePerHour: boxPrice }
          ]
        }
      ],
      paymentSettings: {
        upiId: ownerUpi,
        upiName: ownerName,
        qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(ownerUpi)}&pn=${encodeURIComponent(ownerName)}&cu=INR`,
        advanceEnabled: true,
        advanceType: 'PERCENT',
        advanceValue: 30,
        refundTiers: [
          { hoursBefore: 12, refundPercent: 30 },
          { hoursBefore: 3, refundPercent: 20 },
          { hoursBefore: 0, refundPercent: 0 }
        ]
      }
    });

    setShowOnboardModal(false);
    setGroundName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>BoxKhel Surat Admin Command Center</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Administration</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Assisted turf onboarding on behalf of owners, ground verification, audit trail, and dispute resolution.
          </p>
        </div>

        <button
          onClick={() => setShowOnboardModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 hover:opacity-95 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Owner Ground</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Surat Turfs</span>
          <div className="text-2xl font-black text-white">{grounds.length}</div>
          <span className="text-[10px] text-emerald-400">All registered</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Platform Bookings</span>
          <div className="text-2xl font-black text-emerald-400">{bookings.length}</div>
          <span className="text-[10px] text-slate-400">Direct settlements</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Match GMV</span>
          <div className="text-2xl font-black text-white">₹{totalGMV}</div>
          <span className="text-[10px] text-amber-400">Surat Ecosystem</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">5% Platform Accrual</span>
          <div className="text-2xl font-black text-rose-400">₹{totalCommission}</div>
          <span className="text-[10px] text-slate-400">Waived during promo</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('GROUNDS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GROUNDS'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Grounds Directory ({grounds.length})
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Admin Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Grounds Directory */}
      {activeTab === 'GROUNDS' && (
        <div className="space-y-3">
          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
            {grounds.map((g) => (
              <div key={g.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850 transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-sm">{g.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' :
                      g.status === 'SUSPENDED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    {g.area}, Surat • Owner: {g.ownerName} ({g.phone}) • {g.boxes.length} Box(es)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {g.status !== 'VERIFIED' && (
                    <button
                      onClick={() => toggleGroundStatus(g.id, 'VERIFIED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                    >
                      Verify / Activate
                    </button>
                  )}
                  {g.status !== 'SUSPENDED' && (
                    <button
                      onClick={() => toggleGroundStatus(g.id, 'SUSPENDED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System & Admin Audit Logs</h3>
          <div className="divide-y divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 space-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-mono text-emerald-400 font-bold">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-200 font-semibold">{log.details}</p>
                <span className="text-slate-500 text-[10px]">By: {log.adminName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Assisted Owner Onboarding */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowOnboardModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white mb-1">Assisted Owner Onboarding</h3>
            <p className="text-xs text-slate-400 mb-4">Register turf details on behalf of non-tech turf owner (US-8)</p>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Owner Phone Number</label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Ground Name</label>
                <input
                  type="text"
                  placeholder="e.g. Surat Titans Box Arena"
                  value={groundName}
                  onChange={(e) => setGroundName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Area in Surat</label>
                  <select
                    value={groundArea}
                    onChange={(e) => setGroundArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {SURAT_AREAS.filter(a => a !== 'All Areas').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Ground Contact Phone</label>
                  <input
                    type="text"
                    value={groundPhone}
                    onChange={(e) => setGroundPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Address Line</label>
                <input
                  type="text"
                  value={groundAddress}
                  onChange={(e) => setGroundAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 block">Initial Box Unit & Pricing</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={boxName}
                    onChange={(e) => setBoxName(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                  <input
                    type="number"
                    value={boxPrice}
                    onChange={(e) => setBoxPrice(Number(e.target.value))}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Owner Direct UPI ID</label>
                <input
                  type="text"
                  value={ownerUpi}
                  onChange={(e) => setOwnerUpi(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg"
              >
                Register & Verify Ground
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
