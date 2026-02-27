import {
  Printer,
  Calendar,
  Phone,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const PrescriptionDetail = ({ rx, onPrint }) => (
  <div className="vp-rx-wrap" id={`rx-print-${rx.id}`}>
    <div className="rx-pad">
      {/* Letterhead */}
      <div className="rx-header">
        <div className="rx-header-accent" />
        <div className="rx-header-body">
          <div className="rx-logo-area">
            <div className="rx-logo-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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
            <div className="rx-doctor-name">Dr. {rx.doctor_name}</div>
            <div className="rx-doctor-spec">{rx.doctor_specialization}</div>
            <div className="rx-doctor-bmdc">BMDC Reg. No.: {rx.doctor_bmdc || '—'}</div>
          </div>
        </div>
      </div>

      {/* Patient info */}
      <div className="rx-meta-row">
        <div className="rx-meta-block">
          <span className="rx-meta-label">Patient</span>
          <span className="rx-meta-value">{rx.patient_name || '—'}</span>
        </div>
        {rx.patient_age && (
          <div className="rx-meta-block">
            <span className="rx-meta-label">Age / Sex</span>
            <span className="rx-meta-value">
              {rx.patient_age} yrs {rx.patient_gender ? `/ ${rx.patient_gender}` : ''}
            </span>
          </div>
        )}
        {rx.patient_phone && (
          <div className="rx-meta-block">
            <span className="rx-meta-label"><Phone size={11} /> Phone</span>
            <span className="rx-meta-value">{rx.patient_phone}</span>
          </div>
        )}
        <div className="rx-meta-block rx-meta-block--right">
          <span className="rx-meta-label">Date</span>
          <span className="rx-meta-value">{formatDate(rx.created_at)}</span>
        </div>
      </div>

      {/* Diagnosis */}
      {rx.diagnosis && (
        <div className="rx-diagnosis-box">
          <div className="rx-field-label">Diagnosis / Chief Complaint</div>
          <div className="rx-diagnosis-text">{rx.diagnosis}</div>
        </div>
      )}

      {/* Rx symbol + medicines */}
      <div className="rx-symbol">℞</div>

      {rx.medicines && rx.medicines.length > 0 ? (
        <div className="rx-medicines">
          {rx.medicines.map((med, mi) => (
            <div key={mi} className="rx-med-row">
              <div className="rx-med-number">{mi + 1}.</div>
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
      {rx.lab_tests && rx.lab_tests.length > 0 && (
        <div className="rx-labs-section">
          <div className="rx-labs-title">
            <FlaskConical size={13} /> Investigations / Lab Tests
          </div>
          <div className="rx-labs-list">
            {rx.lab_tests.map((lab, li) => (
              <div key={li} className="rx-lab-row">
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
      {rx.notes && (
        <div className="rx-notes-section">
          <div className="rx-field-label">Advice / Notes</div>
          <div className="rx-notes-text">{rx.notes}</div>
        </div>
      )}

      {/* Follow-up */}
      {rx.follow_up_date && (
        <div className="rx-followup">
          <Calendar size={13} />
          <span>Follow-up: <strong>{formatDate(rx.follow_up_date)}</strong></span>
        </div>
      )}

      {/* Footer */}
      <div className="rx-footer">
        <div className="rx-footer-sig">
          <div className="rx-sig-line" />
          <div className="rx-sig-name">Dr. {rx.doctor_name}</div>
          <div className="rx-sig-spec">{rx.doctor_specialization}</div>
        </div>
        <div className="rx-footer-stamp">
          <div className="rx-stamp">
            <CheckCircle2 size={14} /> ISSUED
          </div>
          <div className="rx-footer-id">Rx #{rx.id}</div>
        </div>
      </div>
    </div>

    {/* Print button */}
    <div className="vp-print-bar">
      <button className="vp-print-btn" onClick={() => onPrint(rx.id)}>
        <Printer size={15} /> Print Prescription
      </button>
    </div>
  </div>
);

export default PrescriptionDetail;
