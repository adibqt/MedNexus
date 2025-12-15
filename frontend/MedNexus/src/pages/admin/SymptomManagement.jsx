import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Edit3, X } from 'lucide-react';
import apiService from '../../services/api';
import './SymptomManagement.css';

const SymptomManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    specialization: '',
    is_active: true,
  });

  const isEditing = form.id !== null;

  const load = async () => {
    try {
      setLoading(true);
      const [symptomsData, specsData] = await Promise.all([
        apiService.getSymptoms(),
        apiService.getSpecializations(),
      ]);
      setItems(symptomsData);
      setSpecializations(specsData);
    } catch (e) {
      setError(e.message || 'Failed to load symptoms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      description: '',
      specialization: '',
      is_active: true,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        specialization: form.specialization || null,
        is_active: form.is_active,
      };
      if (isEditing) {
        const updated = await apiService.updateSymptom(form.id, payload);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await apiService.createSymptom(payload);
        setItems((prev) => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e.message || 'Failed to save symptom');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sym) => {
    setForm({
      id: sym.id,
      name: sym.name,
      description: sym.description || '',
      specialization: sym.specialization || '',
      is_active: sym.is_active,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this symptom?')) return;
    try {
      await apiService.deleteSymptom(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (form.id === id) resetForm();
    } catch (e) {
      setError(e.message || 'Failed to delete symptom');
    }
  };

  return (
    <div className="admin-symptom-page">
      <div className="admin-symptom-header">
        <div className="admin-symptom-header-title">
          <h1>Symptom Management</h1>
          <p>Maintain the list of user-facing symptoms and map them to specializations.</p>
        </div>
        <div className="admin-symptom-pill">
          <Activity size={12} />
          {items.length} symptoms
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-symptom-card"
      >
        {error && (
          <div style={{ fontSize: 12, color: '#b91c1c', marginBottom: 8 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="admin-symptom-form">
          <div className="admin-symptom-field">
            <label>Symptom name</label>
            <input
              type="text"
              className="admin-symptom-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chest pain"
              required
            />
          </div>
          <div className="admin-symptom-field">
            <label>Mapped specialization</label>
            <select
              className="admin-symptom-input admin-symptom-select"
              value={form.specialization}
              onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
            >
              <option value="">Not mapped</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-symptom-field">
            <label>&nbsp;</label>
            <button type="submit" className="admin-symptom-submit" disabled={loading}>
              {isEditing ? 'Update' : 'Add'} symptom
            </button>
          </div>
        </form>

        <table className="admin-symptom-table">
          <thead>
            <tr>
              <th>Symptom</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan="4" className="admin-symptom-empty">
                  Loading symptoms...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="4" className="admin-symptom-empty">
                  No symptoms defined yet.
                </td>
              </tr>
            ) : (
              items.map((sym) => (
                <tr key={sym.id}>
                  <td>{sym.name}</td>
                  <td>{sym.specialization || '-'}</td>
                  <td>
                    <span
                      className={`admin-symptom-status-pill ${
                        sym.is_active ? 'active' : 'inactive'
                      }`}
                    >
                      <span className="admin-symptom-status-dot" />
                      {sym.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-symptom-actions">
                      <button
                        type="button"
                        className="admin-symptom-btn"
                        title="Edit"
                        onClick={() => handleEdit(sym)}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-symptom-btn"
                        title="Delete"
                        onClick={() => handleDelete(sym.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default SymptomManagement;


