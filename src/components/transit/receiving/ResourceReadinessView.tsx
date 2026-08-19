import React from 'react';
import {
  HeartPulse,
  Building2,
  CheckCircle2,
  AlertTriangle,
  User,
  Activity,
  Droplets,
  Layers,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface ResourceReadinessViewProps {
  state: TransferRequestState;
}

export const ResourceReadinessView: React.FC<ResourceReadinessViewProps> = ({ state }) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Hospital Resource & Cath Lab Readiness</h2>
          <p className="text-xs text-slate-500">SGPGI Lucknow • Real-time emergency asset and catheterization suite allocation</p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold self-start sm:self-auto">
          ● APEX PCI SUITES READY
        </span>
      </div>

      {/* Cath Lab Suites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cath Lab 01 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-xs">
                01
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cath Lab Suite 01 (Elective)</h3>
                <p className="text-[11px] text-slate-500">Scheduled Diagnostic & Stenting</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
              In Procedure (Case 3/4)
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Primary Operator:</span>
              <span className="font-semibold text-slate-900">Dr. P. K. Mehrotra, DM</span>
            </div>
            <div className="flex justify-between">
              <span>Current Procedure:</span>
              <span className="font-semibold text-slate-900">Complex Bifurcation PCI</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Turnover:</span>
              <span className="font-mono font-bold text-slate-700">~35 min</span>
            </div>
          </div>
        </div>

        {/* Cath Lab 02 */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                02
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cath Lab Suite 02 (Emergency PCI Standby)</h3>
                <p className="text-[11px] text-emerald-700 font-semibold">Reserved for Kanpur Referral (Rajesh Kumar)</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[10px] uppercase">
              STANDBY LOCKED
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Interventional Chief:</span>
              <span className="font-semibold text-slate-900">Dr. Vivek Saxena, DM</span>
            </div>
            <div className="flex justify-between">
              <span>Circulating Staff:</span>
              <span className="font-semibold text-slate-900">Cath Nurse Lead + 2 Scrub Techs</span>
            </div>
            <div className="flex justify-between">
              <span>Hemodynamic Support:</span>
              <span className="font-semibold text-emerald-700">IABP / Impella Standby Primed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bed Capacity & Blood Bank */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <span>Coronary Care Unit (CCU)</span>
            <span className="text-emerald-700 font-bold">3 Beds Free</span>
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between"><span>Bed 01:</span> <span className="font-bold text-slate-800">Occupied (Post-CABG)</span></div>
            <div className="flex justify-between"><span>Bed 02:</span> <span className="font-bold text-slate-800">Occupied (NSTEMI)</span></div>
            <div className="flex justify-between"><span>Bed 03:</span> <span className="font-bold text-emerald-700">HOLD: Rajesh Kumar</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <span>Emergency Blood Bank</span>
            <span className="text-red-700 font-bold">Adequate Stock</span>
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between"><span>O+ (Packed RBC):</span> <span className="font-bold text-slate-800">14 Units</span></div>
            <div className="flex justify-between"><span>O- (Universal Donor):</span> <span className="font-bold text-slate-800">4 Units</span></div>
            <div className="flex justify-between"><span>Fresh Frozen Plasma:</span> <span className="font-bold text-slate-800">18 Units</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <span>Critical Diagnostic Roster</span>
            <span className="text-sky-700 font-bold">24/7 Active</span>
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between"><span>Point-of-Care Echo:</span> <span className="font-bold text-slate-800">Available in Bay 2</span></div>
            <div className="flex justify-between"><span>Rapid Trop-I Analyzer:</span> <span className="font-bold text-slate-800">Calibrated</span></div>
            <div className="flex justify-between"><span>Direct Bay Bypass:</span> <span className="font-bold text-emerald-700">Enabled</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
