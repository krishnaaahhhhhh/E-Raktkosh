import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Server,
  ArrowUpRight
} from 'lucide-react';
import { AppViewMode } from '../../types';

interface CommandEmergencyFeedProps {
  recentDispatches: any[];
  setMode: (mode: AppViewMode) => void;
}

export const CommandEmergencyFeed: React.FC<CommandEmergencyFeedProps> = ({
  recentDispatches,
  setMode
}) => {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Panel 1: Live Emergency Feed */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 flex flex-col shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>LIVE EMERGENCY INTAKE FEED</span>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            REALTIME
          </span>
        </div>

        {/* Emergency Feed Stream */}
        <div className="space-y-2 overflow-y-auto max-h-[190px] custom-scrollbar pr-1">
          {recentDispatches && recentDispatches.length > 0 ? (
            recentDispatches.map((disp, i) => (
              <div
                key={disp.dispatchId || i}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] font-mono">
                      {disp.createdAt ? new Date(disp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:26'}
                    </span>
                    <span className="text-slate-900 font-bold text-[11px]">{disp.hospitalName || 'Emergency Case'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{disp.patientName || 'Critical Patient'} • {disp.symptomCategory || 'Trauma'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                  disp.severity === 'RED' ? 'bg-rose-100 text-rose-700' :
                  disp.severity === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {disp.severity || 'CRITICAL'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-slate-400 text-xs">
              <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <span>No emergency dispatches in active queue.</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 text-right">
          <button
            onClick={() => setMode('coordinate')}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open Regional Coordination (/coordinate)</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Panel 2: System Health Overview */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-600" />
          <span>SYSTEM HEALTH OVERVIEW</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { name: 'Partner Mesh Gateway', status: '100%', ok: true },
            { name: 'Hospital API Gateway', status: '100%', ok: true },
            { name: 'Blood Inventory Sync', status: '100%', ok: true },
            { name: 'Ambulance GPS Stream', status: '100%', ok: true },
            { name: 'WebSocket Broadcast', status: '100%', ok: true }
          ].map((srv, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600">{srv.name}</span>
              </div>
              <span className="text-emerald-600 font-bold font-mono">{srv.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
