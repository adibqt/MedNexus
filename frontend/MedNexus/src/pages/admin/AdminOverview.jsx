import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Stethoscope,
  CalendarClock,
  FileText,
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Activity,
  Pill,
  Building2,
  UserPlus,
  RefreshCw,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import apiService from '../../services/api';
import './AdminOverview.css';

/* ── Cache helpers ───────────────────────────────────────── */
const CACHE_KEY = 'adm_overview_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}
function setCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); }
  catch { /* quota */ }
}

/* ── Color palettes ──────────────────────────────────────── */
const APPT_STATUS_COLORS = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Completed: '#10b981',
  Cancelled: '#ef4444',
  Rescheduled: '#8b5cf6',
};

const SEVERITY_COLORS = {
  low: '#10b981',
  moderate: '#f59e0b',
  high: '#ef4444',
};

const SPEC_COLORS = [
  '#6366f1', '#3b82f6', '#0891b2', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
];

/* ── Custom Recharts Tooltip ─────────────────────────────── */
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ov-tooltip">
      {label && <p className="ov-tooltip__label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="ov-tooltip__row">
          <span className="ov-tooltip__dot" style={{ background: p.color || p.fill }} />
          <span className="ov-tooltip__name">{p.name || p.dataKey}</span>
          <span className="ov-tooltip__val">{formatter ? formatter(p.value) : p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

/* ── KPI Card ────────────────────────────────────────────── */
const KpiCard = ({ icon: Icon, label, value, subValue, growth, gradient, delay }) => {
  const isPositive = growth > 0;
  const isZero = growth === 0;
  const TrendIcon = isPositive ? TrendingUp : isZero ? Minus : TrendingDown;
  return (
    <motion.div
      className="ov-kpi"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.45 }}
    >
      <div className="ov-kpi__icon" style={{ background: gradient }}>
        <Icon size={22} />
      </div>
      <div className="ov-kpi__body">
        <span className="ov-kpi__label">{label}</span>
        <span className="ov-kpi__value">{value.toLocaleString()}</span>
        <div className="ov-kpi__footer">
          {subValue && <span className="ov-kpi__sub">{subValue}</span>}
          {growth !== undefined && (
            <span className={`ov-kpi__growth ${isPositive ? 'up' : isZero ? 'flat' : 'down'}`}>
              <TrendIcon size={13} />
              {Math.abs(growth)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Chart Card wrapper ──────────────────────────────────── */
const ChartCard = ({ title, subtitle, children, delay = 0, className = '' }) => (
  <motion.div
    className={`ov-card ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 + delay * 0.1, duration: 0.5 }}
  >
    <div className="ov-card__header">
      <div>
        <h3 className="ov-card__title">{title}</h3>
        {subtitle && <p className="ov-card__subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="ov-card__body">{children}</div>
  </motion.div>
);

/* ── Donut center label ──────────────────────────────────── */
const DonutCenter = ({ total, label }) => (
  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="central"
    className="ov-donut-center"
  >
    <tspan x="50%" dy="-8" className="ov-donut-center__val">
      {total.toLocaleString()}
    </tspan>
    <tspan x="50%" dy="22" className="ov-donut-center__label">
      {label}
    </tspan>
  </text>
);

/* ══════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════ */
const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCache();
      if (cached) { setData(cached); setLoading(false); return; }
    }
    try {
      setLoading(true);
      const res = await apiService.getAdminOverviewStats();
      setData(res);
      setCache(res);
    } catch (e) {
      console.error('Overview fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Loading skeleton ──────────────────────────────────── */
  if (loading && !data) {
    return (
      <div className="ov-loading">
        <div className="ov-loading__spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ov-loading">
        <p style={{ color: '#ef4444' }}>Failed to load overview data.</p>
        <button className="ov-retry-btn" onClick={() => load(true)}>Retry</button>
      </div>
    );
  }

  const { kpi, registration_trend, appointment_trend, appointment_statuses, ai_severity, top_specializations, recent_registrations } = data;

  /* ── Prepare chart data ──────────────────────────────── */
  const apptStatusData = Object.entries(appointment_statuses).map(([name, value]) => ({
    name,
    value,
  }));
  const apptStatusTotal = apptStatusData.reduce((s, d) => s + d.value, 0);

  const severityData = Object.entries(ai_severity).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
  const severityTotal = severityData.reduce((s, d) => s + d.value, 0);

  const maxSpecCount = top_specializations.length ? Math.max(...top_specializations.map(s => s.count)) : 1;

  return (
    <div className="ov-root">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="ov-page-header">
        <div>
          <h2 className="ov-page-title">Platform Overview</h2>
          <p className="ov-page-subtitle">Real-time analytics and usage metrics</p>
        </div>
        <button className="ov-refresh-btn" onClick={() => load(true)} title="Refresh data">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ── KPI Row ────────────────────────────────────── */}
      <div className="ov-kpi-row">
        <KpiCard icon={Users} label="Total Patients" value={kpi.total_patients}
          subValue={`${kpi.patients_this_month} this month`}
          growth={kpi.patient_growth}
          gradient="linear-gradient(135deg, #10b981, #06b6d4)" delay={0} />
        <KpiCard icon={Stethoscope} label="Active Doctors" value={kpi.approved_doctors}
          subValue={`${kpi.total_doctors} registered`}
          growth={kpi.doctor_growth}
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" delay={1} />
        <KpiCard icon={CalendarClock} label="Appointments" value={kpi.total_appointments}
          subValue={`${kpi.appointments_this_month} this month`}
          growth={kpi.appt_growth}
          gradient="linear-gradient(135deg, #3b82f6, #0ea5e9)" delay={2} />
        <KpiCard icon={Cpu} label="AI Consultations" value={kpi.total_ai_consultations}
          subValue={`${kpi.ai_this_month} this month`}
          growth={kpi.ai_growth}
          gradient="linear-gradient(135deg, #f59e0b, #ef4444)" delay={3} />
        <KpiCard icon={FileText} label="Prescriptions" value={kpi.total_prescriptions}
          subValue={`${kpi.total_pharmacies} pharmacies · ${kpi.total_clinics} clinics`}
          gradient="linear-gradient(135deg, #ec4899, #f43f5e)" delay={4} />
      </div>

      {/* ── Row 2: Registration Trend + Appt Status ───── */}
      <div className="ov-chart-row ov-chart-row--wide-narrow">
        <ChartCard title="User Registration Trend" subtitle="Patient & doctor sign-ups over the last 12 months" delay={1}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={registration_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDoctors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month_short" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="patients" name="Patients" stroke="#10b981" strokeWidth={2.5}
                fill="url(#gradPatients)" activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} />
              <Area type="monotone" dataKey="doctors" name="Doctors" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#gradDoctors)" activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Appointment Status" subtitle="Distribution of all appointments" delay={2}>
          {apptStatusTotal === 0 ? (
            <div className="ov-empty-chart">
              <CalendarClock size={40} />
              <p>No appointments yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={apptStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {apptStatusData.map((entry, i) => (
                    <Cell key={i} fill={APPT_STATUS_COLORS[entry.name] || '#9ca3af'} className="ov-pie-cell" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <DonutCenter total={apptStatusTotal} label="Total" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Appointment Trend + AI Severity ────── */}
      <div className="ov-chart-row ov-chart-row--wide-narrow">
        <ChartCard title="Monthly Appointments" subtitle="Appointment volume over the last 6 months" delay={3}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointment_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month_short" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Bar dataKey="count" name="Appointments" fill="url(#gradBar)" radius={[6, 6, 0, 0]}
                maxBarSize={48} className="ov-bar-cell" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI Severity Analysis" subtitle="Severity of AI-powered consultations" delay={4}>
          {severityTotal === 0 ? (
            <div className="ov-empty-chart">
              <Cpu size={40} />
              <p>No AI consultations yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.name.toLowerCase()] || '#9ca3af'} className="ov-pie-cell" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <DonutCenter total={severityTotal} label="Total" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 4: Top specializations + Recent activity ─ */}
      <div className="ov-chart-row ov-chart-row--equal">
        <ChartCard title="Top Specializations" subtitle="Most popular doctor specializations" delay={5}>
          {top_specializations.length === 0 ? (
            <div className="ov-empty-chart">
              <Stethoscope size={40} />
              <p>No doctor specializations yet</p>
            </div>
          ) : (
            <div className="ov-hbar-list">
              {top_specializations.map((spec, i) => (
                <div className="ov-hbar" key={spec.name}>
                  <div className="ov-hbar__label">
                    <span className="ov-hbar__rank">#{i + 1}</span>
                    <span className="ov-hbar__name">{spec.name}</span>
                  </div>
                  <div className="ov-hbar__track">
                    <motion.div
                      className="ov-hbar__fill"
                      style={{ background: SPEC_COLORS[i % SPEC_COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(spec.count / maxSpecCount) * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.6 }}
                    />
                  </div>
                  <span className="ov-hbar__count">{spec.count}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Recent Registrations" subtitle="Latest platform sign-ups" delay={6}>
          {recent_registrations.length === 0 ? (
            <div className="ov-empty-chart">
              <UserPlus size={40} />
              <p>No registrations yet</p>
            </div>
          ) : (
            <div className="ov-activity-list">
              {recent_registrations.map((r, i) => {
                const isDoctor = r.type === 'doctor';
                const Icon = isDoctor ? Stethoscope : Users;
                const dateStr = r.date ? new Date(r.date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                }) : '';
                return (
                  <motion.div
                    className="ov-activity"
                    key={`${r.type}-${r.name}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <div className={`ov-activity__icon ${isDoctor ? 'doctor' : 'patient'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="ov-activity__info">
                      <span className="ov-activity__name">{r.name}</span>
                      <span className="ov-activity__detail">{r.detail}</span>
                    </div>
                    <div className="ov-activity__meta">
                      <span className={`ov-activity__badge ${r.type}`}>{isDoctor ? 'Doctor' : 'Patient'}</span>
                      <span className="ov-activity__date">
                        <Clock size={11} />
                        {dateStr}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminOverview;
