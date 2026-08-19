import React from 'react';
import {
  History,
  CheckCircle2,
  Download,
  Printer,
  Search,
  Filter,
  Calendar,
  Building2,
  Clock,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface TransferHistoryViewProps {
  state: TransferRequestState;
  onOpenPdf: () => void;
}

export const TransferHistoryView: React.FC<TransferHistoryViewProps> = ({
  state,
  onOpenPdf,
}) => {
  const historyData = [
    {
      id: 'TR-2026-0817-0912',
      patient: 'Vikram Sethi',
      age: 58,
      gender: 'M',
      diagnosis: 'Acute Inferior Wall STEMI',
      destination: 'SGPGI Lucknow',
      outcome: 'Primary PCI Successful (DES placed)',
      doorToNeedleMin: 18,
      date: '17 Aug 2026',
      status: 'COMPLETED',
    },
    {
      id: 'TR-2026-0816-1402',
      patient: 'Meenakshi Sundaram',
      age: 63,
      gender: 'F',
      diagnosis: 'Acute Aortic Dissection (Type A)',
      destination: 'AIIMS New Delhi',
      outcome: 'Emergency Open Repair Handoff',
      doorToNeedleMin: 24,
      date: '16 Aug 2026',
      status: 'COMPLETED',
    },
    {
      id: 'TR-2026-0815-0811',
      patient: 'Harish Chandra',
      age: 49,
      gender: 'M',
      diagnosis: 'Cardiogenic Shock post-MI',
      destination: 'LPS Institute of Cardiology',
      outcome: 'IABP Assisted Stabilization',
      doorToNeedleMin: 15,
      date: '15 Aug 2026',
      status: 'COMPLETED',
    },
    {
      id: 'TR-2026-0814-2204',
      patient: 'Rameshwar Lal',
      age: 67,
      gender: 'M',
      diagnosis: 'Complete Heart Block with Syncope',
      destination: 'SGPGI Lucknow',
      outcome: 'Temporary Pacemaker -> Permanent PPM',
      doorToNeedleMin: 22,
      date: '14 Aug 2026',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Transfer Records & Audit Ledger</h2>
          <p className="text-xs text-slate-500">Historical logs of inter-hospital clinical handoffs and quality benchmarks</p>
        </div>
        <button
          onClick={onOpenPdf}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export Monthly Audit PDF</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase">Avg Transfer Decision Time</div>
          <div className="text-2xl font-black text-slate-900">14.2 min</div>
          <div className="text-[11px] text-emerald-600 font-semibold">✓ Well within 30 min Golden Hour mandate</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase">E-Dossier ABDM Delivery</div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">✓ Zero lost records or packet drop</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase">Apex PCI Acceptance Rate</div>
          <div className="text-2xl font-black text-slate-900">98.4%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">✓ Direct-to-Cath-Lab fast track</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Inter-Hospital Transfers</h3>
          <span className="text-xs text-slate-500 font-medium">Showing 4 of 48 completed transfers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Transfer ID & Date</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Emergency Diagnosis</th>
                <th className="px-4 py-3">Receiving Center</th>
                <th className="px-4 py-3">Clinical Outcome</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historyData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-slate-900">{row.id}</div>
                    <div className="text-slate-400 text-[11px]">{row.date}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{row.patient}</div>
                    <div className="text-slate-400 text-[11px]">{row.age}y / {row.gender}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{row.diagnosis}</div>
                    <div className="text-slate-400 text-[11px]">Decision: {row.doorToNeedleMin} min</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{row.destination}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-700">{row.outcome}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
