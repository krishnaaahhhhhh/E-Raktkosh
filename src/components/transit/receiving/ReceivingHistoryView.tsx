import React from 'react';
import {
  History,
  CheckCircle2,
  Printer,
  Search,
  Building2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface ReceivingHistoryViewProps {
  state: TransferRequestState;
  onOpenPdf: () => void;
}

export const ReceivingHistoryView: React.FC<ReceivingHistoryViewProps> = ({
  state,
  onOpenPdf,
}) => {
  const historyData = [
    {
      id: 'REC-2026-0818-0019',
      patient: 'Kailash Nath',
      age: 51,
      gender: 'M',
      diagnosis: 'Acute Anterior STEMI',
      origin: 'District Hospital Hardoi',
      arrivalTimeToBalloonMin: 38,
      vesselIntervened: '100% Proximal LAD -> 0% Residual (DES)',
      status: 'DISCHARGED STABLE',
    },
    {
      id: 'REC-2026-0817-0044',
      patient: 'Sunita Mishra',
      age: 59,
      gender: 'F',
      diagnosis: 'Acute Inferior STEMI + RV Infarct',
      origin: 'District Hospital Unnao',
      arrivalTimeToBalloonMin: 44,
      vesselIntervened: 'RCA Stented, Temporary Pacer removed',
      status: 'CCU STEPDOWN',
    },
    {
      id: 'REC-2026-0816-0102',
      patient: 'Om Prakash Tiwari',
      age: 64,
      gender: 'M',
      diagnosis: 'NSTEMI with Refractory Angina',
      origin: 'District Hospital Kanpur',
      arrivalTimeToBalloonMin: 52,
      vesselIntervened: 'Multi-vessel PCI (LAD + LCx)',
      status: 'DISCHARGED STABLE',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Receiving Handoff Archive & Registry</h2>
          <p className="text-xs text-slate-500">SGPGI Lucknow Apex Interventional Cardiology Quality & Outcome Metrics</p>
        </div>
        <button
          onClick={onOpenPdf}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export Registry Report</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase">Median Door-to-Balloon Time</div>
          <div className="text-2xl font-black text-emerald-600">42 min</div>
          <div className="text-[11px] text-slate-500">Benchmark: &lt;90 min (ABDM Golden Hour standard)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase">Direct Cath-Lab Bypass Rate</div>
          <div className="text-2xl font-black text-slate-900">96.5%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Zero ER delay via pre-synced E-Dossier</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase">In-Hospital Survival Rate</div>
          <div className="text-2xl font-black text-slate-900">99.1%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Top tier tertiary cardiac outcome</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Completed Inter-Hospital Handoffs</h3>
          <span className="text-xs text-slate-500">Registry records past 30 days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Referring Origin</th>
                <th className="px-4 py-3">Door-to-Balloon</th>
                <th className="px-4 py-3">Intervention & Result</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historyData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{row.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{row.patient}</div>
                    <div className="text-slate-400 text-[11px]">{row.age}y / {row.gender}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{row.origin}</div>
                    <div className="text-slate-400 text-[11px]">{row.diagnosis}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-black text-emerald-700">{row.arrivalTimeToBalloonMin} min</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-800 font-medium">{row.vesselIntervened}</div>
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
