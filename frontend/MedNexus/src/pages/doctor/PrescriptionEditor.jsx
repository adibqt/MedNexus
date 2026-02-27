import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Printer,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Pill,
  Stethoscope,
  Calendar,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import './PrescriptionEditor.css';

const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'Every 12 hours', 'As needed (PRN)', 'Before meals', 'After meals', 'At bedtime'];
const DUR_OPTIONS  = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '2 months', '3 months', 'Until finished', 'Ongoing'];

const emptyMedicine = () => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
const emptyLabTest  = () => ({ name: '', instructions: '' });

const PrescriptionEditor = () => {
  const navigate  = useNavigate();
  const { appointmentId } = useParams();
  const location  = useLocation();
  const printRef  = useRef(null);

  const appointmentInfo = location.state?.appointmentInfo || null;

  // Form state
  const [diagnosis, setDiagnosis]       = useState('');
  const [notes, setNotes]               = useState('');
  const [medicines, setMedicines]       = useState([emptyMedicine()]);
  const [labTests, setLabTests]         = useState([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [isFinalized, setIsFinalized]   = useState(false);

  // Data from API
  const [rxId, setRxId]                 = useState(null);
  const [doctorInfo, setDoctorInfo]     = useState(null);
  const [patientInfo, setPatientInfo]   = useState(null);
  const [aptInfo, setAptInfo]           = useState(appointmentInfo || null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctor_access_token');
    if (!token) { navigate('/sign-in/doctor', { replace: true }); return; }
    init();
  }, [appointmentId]);

  const init = async () => {
    try {
      setLoading(true);

      // Load doctor info
      const token = localStorage.getItem('doctor_access_token');
      const doctor = await apiService.request('/api/doctors/me', {
        isDoctor: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctorInfo(doctor);

      // Check if a prescription already exists for this appointment
      try {
        const existing = await apiService.getPrescriptionByAppointment(appointmentId);
        // Populate form with existing data
        setRxId(existing.id);
        setDiagnosis(existing.diagnosis || '');
        setNotes(existing.notes || '');
        setMedicines(existing.medicines?.length ? existing.medicines : [emptyMedicine()]);
        setLabTests(existing.lab_tests || []);
        setFollowUpDate(existing.follow_up_date || '');
        setIsFinalized(existing.is_finalized || false);

        // Populate context info if not from navigation state
        if (!aptInfo) {
          setAptInfo({
            appointment_date: existing.appointment_date,
            appointment_time: existing.appointment_time,
            patient_name: existing.patient_name,
          });
        }
        setPatientInfo({
          name: existing.patient_name,
          age: existing.patient_age,
          gender: existing.patient_gender,
          phone: existing.patient_phone,
        });
      } catch {
        // No existing prescription – that's fine
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ── Medicine helpers ──
  const updateMedicine = (i, field, value) => {
    setMedicines((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };
  const addMedicine    = () => setMedicines((p) => [...p, emptyMedicine()]);
  const removeMedicine = (i) => setMedicines((p) => p.filter((_, idx) => idx !== i));

  // ── Lab test helpers ──
  const updateLabTest  = (i, field, value) => setLabTests((p) => p.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const addLabTest     = () => setLabTests((p) => [...p, emptyLabTest()]);
  const removeLabTest  = (i) => setLabTests((p) => p.filter((_, idx) => idx !== i));

  // ── Save ──
  const handleSave = async (finalize = false) => {
    const validMeds = medicines.filter((m) => m.name.trim());
    const validLabs = labTests.filter((t) => t.name.trim());

    if (!diagnosis.trim() && validMeds.length === 0 && validLabs.length === 0) {
      setError('Please add a diagnosis or at least one medicine/lab test.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        diagnosis,
        notes,
        medicines: validMeds,
        lab_tests: validLabs,
        follow_up_date: followUpDate || null,
        is_finalized: finalize,
      };

      let saved;
      if (rxId) {
        saved = await apiService.updatePrescription(rxId, payload);
      } else {
        saved = await apiService.createPrescription({
          appointment_id: parseInt(appointmentId),
          ...payload,
        });
        setRxId(saved.id);
      }

      if (!patientInfo) {
        setPatientInfo({
          name: saved.patient_name,
          age: saved.patient_age,
          gender: saved.patient_gender,
          phone: saved.patient_phone,
        });
      }
      setIsFinalized(finalize);
      setSuccess(finalize ? 'Prescription finalized and issued!' : 'Draft saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="pe-loading">
        <div className="pe-spinner" />
      </div>
    );
  }

  const displayPatient = patientInfo || (aptInfo ? { name: aptInfo.patient_name } : null);
  const validMeds = medicines.filter((m) => m.name.trim());
  const validLabs = labTests.filter((t) => t.name.trim());

  return (
    <div className="pe-page">
      {/* ── Top bar ──────────────────────────── */}
      <div className="pe-topbar">
        <button className="pe-back-btn" onClick={() => navigate('/doctor/prescriptions')}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="pe-topbar-title">
          <FileText size={18} />
          Write E‑Prescription
          {isFinalized && <span className="pe-finalized-tag"><CheckCircle2 size={12} /> Finalized</span>}
        </div>
        <div className="pe-topbar-actions">
          {!isFinalized && (
            <>
              <button className="pe-action-btn pe-action-btn--outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button className="pe-action-btn pe-action-btn--green" onClick={() => handleSave(true)} disabled={saving}>
                <CheckCircle2 size={14} /> Issue Prescription
              </button>
            </>
          )}
          <button className="pe-action-btn pe-action-btn--print" onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="pe-alert pe-alert--error">
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div className="pe-alert pe-alert--success">
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      <div className="pe-body">
        {/* ── Left: Form ───────────────────── */}
        <div className="pe-form-panel">
          {/* Patient info strip */}
          <div className="pe-section pe-section--info">
            <div className="pe-section-title"><User size={14} /> Patient Information</div>
            <div className="pe-info-grid">
              <div className="pe-info-row">
                <span className="pe-info-label">Name</span>
                <span className="pe-info-value">{displayPatient?.name || '—'}</span>
              </div>
              {displayPatient?.age && (
                <div className="pe-info-row">
                  <span className="pe-info-label">Age</span>
                  <span className="pe-info-value">{displayPatient.age} yrs{displayPatient.gender ? ` · ${displayPatient.gender}` : ''}</span>
                </div>
              )}
              <div className="pe-info-row">
                <span className="pe-info-label">Appointment</span>
                <span className="pe-info-value">
                  {formatDate(aptInfo?.appointment_date)}
                  {aptInfo?.appointment_time ? ` at ${formatTime(aptInfo.appointment_time)}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="pe-section">
            <div className="pe-section-title"><Stethoscope size={14} /> Diagnosis / Chief Complaint</div>
            <textarea
              className="pe-textarea"
              rows={3}
              placeholder="Enter diagnosis or chief complaint…"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={isFinalized}
            />
          </div>

          {/* Medicines */}
          <div className="pe-section">
            <div className="pe-section-header">
              <div className="pe-section-title"><Pill size={14} /> Medicines</div>
              {!isFinalized && (
                <button className="pe-add-btn" onClick={addMedicine}>
                  <Plus size={13} /> Add Medicine
                </button>
              )}
            </div>

            <div className="pe-medicines-list">
              {medicines.map((med, i) => (
                <motion.div
                  key={i}
                  className="pe-medicine-card"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="pe-med-num">{i + 1}</div>
                  <div className="pe-med-fields">
                    <input
                      className="pe-input pe-input--full"
                      placeholder="Medicine name (e.g. Amoxicillin 500mg)"
                      value={med.name}
                      onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                      disabled={isFinalized}
                    />
                    <div className="pe-med-row-3">
                      <input
                        className="pe-input"
                        placeholder="Dosage (e.g. 1 tablet)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                        disabled={isFinalized}
                      />
                      <select
                        className="pe-select"
                        value={med.frequency}
                        onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}
                        disabled={isFinalized}
                      >
                        <option value="">Frequency…</option>
                        {FREQ_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select
                        className="pe-select"
                        value={med.duration}
                        onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                        disabled={isFinalized}
                      >
                        <option value="">Duration…</option>
                        {DUR_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <input
                      className="pe-input pe-input--full"
                      placeholder="Special instructions (optional)"
                      value={med.instructions}
                      onChange={(e) => updateMedicine(i, 'instructions', e.target.value)}
                      disabled={isFinalized}
                    />
                  </div>
                  {!isFinalized && medicines.length > 1 && (
                    <button className="pe-remove-btn" onClick={() => removeMedicine(i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lab Tests */}
          <div className="pe-section">
            <div className="pe-section-header">
              <div className="pe-section-title"><FlaskConical size={14} /> Lab Tests / Investigations</div>
              {!isFinalized && (
                <button className="pe-add-btn" onClick={addLabTest}>
                  <Plus size={13} /> Add Test
                </button>
              )}
            </div>

            {labTests.length === 0 && !isFinalized ? (
              <p className="pe-empty-hint">No lab tests added. Click "Add Test" to include investigations.</p>
            ) : (
              <div className="pe-labs-list">
                {labTests.map((lab, i) => (
                  <motion.div
                    key={i}
                    className="pe-lab-card"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pe-lab-num">{i + 1}</div>
                    <div className="pe-lab-fields">
                      <input
                        className="pe-input pe-input--full"
                        placeholder="Test name (e.g. Complete Blood Count (CBC))"
                        value={lab.name}
                        onChange={(e) => updateLabTest(i, 'name', e.target.value)}
                        disabled={isFinalized}
                      />
                      <input
                        className="pe-input pe-input--full"
                        placeholder="Instructions (e.g. Fasting required)"
                        value={lab.instructions}
                        onChange={(e) => updateLabTest(i, 'instructions', e.target.value)}
                        disabled={isFinalized}
                      />
                    </div>
                    {!isFinalized && (
                      <button className="pe-remove-btn" onClick={() => removeLabTest(i)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Follow-up */}
          <div className="pe-section">
            <div className="pe-section-title"><FileText size={14} /> Additional Notes &amp; Advice</div>
            <textarea
              className="pe-textarea"
              rows={3}
              placeholder="Any additional advice, lifestyle changes, or precautions…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isFinalized}
            />
          </div>

          <div className="pe-section">
            <div className="pe-section-title"><Calendar size={14} /> Follow-up Date</div>
            <input
              type="date"
              className="pe-input"
              value={followUpDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={isFinalized}
            />
          </div>

          {!isFinalized && (
            <div className="pe-bottom-actions">
              <button className="pe-action-btn pe-action-btn--outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button className="pe-action-btn pe-action-btn--green pe-action-btn--lg" onClick={() => handleSave(true)} disabled={saving}>
                <CheckCircle2 size={15} /> Issue Prescription
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Template preview ──────── */}
        <div className="pe-preview-panel" ref={printRef}>
          <div className="rx-pad">
            {/* Letterhead */}
            <div className="rx-header">
              <div className="rx-header-accent" />
              <div className="rx-header-body">
                <div className="rx-logo-area">
                  <div className="rx-logo-icon">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#0d9488" opacity="0.12"/>
                      <path d="M19 8h-2V6c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v2h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6h2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z" fill="#0d9488"/>
                      <path d="M5 14h4v2H5z" fill="#0d9488" opacity="0.5"/>
                      <path d="M5 10h4v2H5z" fill="#0d9488" opacity="0.5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="rx-clinic-name">MedNexus Healthcare</div>
                    <div className="rx-clinic-tagline">Connected Care · Anytime · Anywhere</div>
                  </div>
                </div>
                <div className="rx-header-sep" />
                <div className="rx-doctor-info">
                  <div className="rx-doctor-name">Dr. {doctorInfo?.name || '—'}</div>
                  <div className="rx-doctor-spec">{doctorInfo?.specialization || ''}</div>
                  <div className="rx-doctor-bmdc">BMDC Reg. No.: {doctorInfo?.bmdc_number || '—'}</div>
                </div>
              </div>
            </div>

            {/* Patient row & date */}
            <div className="rx-meta-row">
              <div className="rx-meta-block">
                <span className="rx-meta-label">Patient</span>
                <span className="rx-meta-value">{displayPatient?.name || '—'}</span>
              </div>
              {displayPatient?.age && (
                <div className="rx-meta-block">
                  <span className="rx-meta-label">Age / Sex</span>
                  <span className="rx-meta-value">
                    {displayPatient.age} yrs {displayPatient.gender ? `/ ${displayPatient.gender}` : ''}
                  </span>
                </div>
              )}
              {displayPatient?.phone && (
                <div className="rx-meta-block">
                  <span className="rx-meta-label"><Phone size={11} /> Phone</span>
                  <span className="rx-meta-value">{displayPatient.phone}</span>
                </div>
              )}
              <div className="rx-meta-block rx-meta-block--right">
                <span className="rx-meta-label">Date</span>
                <span className="rx-meta-value">{today}</span>
              </div>
            </div>

            {/* Diagnosis */}
            {(diagnosis || !isFinalized) && (
              <div className="rx-diagnosis-box">
                <div className="rx-field-label">Diagnosis / Chief Complaint</div>
                <div className="rx-diagnosis-text">{diagnosis || <span className="rx-placeholder">—</span>}</div>
              </div>
            )}

            {/* Rx symbol + medicines */}
            <div className="rx-symbol">℞</div>

            {validMeds.length > 0 ? (
              <div className="rx-medicines">
                {validMeds.map((med, i) => (
                  <div key={i} className="rx-med-row">
                    <div className="rx-med-number">{i + 1}.</div>
                    <div className="rx-med-body">
                      <div className="rx-med-name">{med.name}</div>
                      <div className="rx-med-details">
                        {med.dosage && <span>{med.dosage}</span>}
                        {med.frequency && <span> · {med.frequency}</span>}
                        {med.duration && <span> · {med.duration}</span>}
                      </div>
                      {med.instructions && (
                        <div className="rx-med-instructions">Sig: {med.instructions}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rx-placeholder-block">No medicines prescribed</div>
            )}

            {/* Lab tests */}
            {validLabs.length > 0 && (
              <div className="rx-labs-section">
                <div className="rx-labs-title">
                  <FlaskConical size={13} /> Investigations / Lab Tests
                </div>
                <div className="rx-labs-list">
                  {validLabs.map((lab, i) => (
                    <div key={i} className="rx-lab-row">
                      <span className="rx-lab-bullet">▸</span>
                      <div>
                        <div className="rx-lab-name">{lab.name}</div>
                        {lab.instructions && <div className="rx-lab-inst">{lab.instructions}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="rx-notes-section">
                <div className="rx-field-label">Advice / Notes</div>
                <div className="rx-notes-text">{notes}</div>
              </div>
            )}

            {/* Follow-up */}
            {followUpDate && (
              <div className="rx-followup">
                <Calendar size={13} />
                <span>Follow-up: <strong>{formatDate(followUpDate)}</strong></span>
              </div>
            )}

            {/* Footer */}
            <div className="rx-footer">
              <div className="rx-footer-sig">
                <div className="rx-sig-line" />
                <div className="rx-sig-name">Dr. {doctorInfo?.name || '—'}</div>
                <div className="rx-sig-spec">{doctorInfo?.specialization || ''}</div>
              </div>
              <div className="rx-footer-stamp">
                {isFinalized && (
                  <div className="rx-stamp">
                    <CheckCircle2 size={14} />
                    ISSUED
                  </div>
                )}
                <div className="rx-footer-id">{rxId ? `Rx #${rxId}` : 'Draft'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionEditor;
