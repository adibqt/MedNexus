import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Edit3 } from 'lucide-react';
import apiService from '../../services/api';
import './SpecializationManagement.css';

const SpecializationManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    is_active: true,
  });

  const isEditing = form.id !== null;

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSpecializations();
      setItems(data);
    } catch (e) {
      setError(e.message || 'Failed to load specializations');
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
      is_active: true,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setLoading(true);
      if (isEditing) {
        const updated = await apiService.updateSpecialization(form.id, {
          name: form.name.trim(),
          description: form.description || null,
          is_active: form.is_active,
        });
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await apiService.createSpecialization({
          name: form.name.trim(),
          description: form.description || null,
          is_active: form.is_active,
        });
        setItems((prev) => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e.message || 'Failed to save specialization');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spec) => {
    setForm({
      id: spec.id,
      name: spec.name,
      description: spec.description || '',
      is_active: spec.is_active,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this specialization?')) return;
    try {
      await apiService.deleteSpecialization(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (form.id === id) resetForm();
    } catch (e) {
      setError(e.message || 'Failed to delete specialization');
    }
  };

  return (
    <div className="admin-special-page">
      <div className="admin-special-header">
        <div className="admin-special-header-title">
          <h1>Specialization Management</h1>
          <p>Define and maintain medical specializations used across the platform.</p>
        </div>
        <div className="admin-special-pill">
          <CheckCircle2 size={12} />
          {items.length} specializations
        </div>
      </div>

      <div className="admin-special-grid">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-special-card"
        >
          <div className="admin-special-card-header">
            <h2>{isEditing ? 'Edit specialization' : 'Add specialization'}</h2>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#b91c1c', marginBottom: 8 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="admin-special-form">
            <div className="admin-special-field">
              <label>Name</label>
              <input
                type="text"
                className="admin-special-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Cardiology"
                required
              />
            </div>
            <div className="admin-special-field">
              <label>Description</label>
              <textarea
                className="admin-special-textarea"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description for internal reference"
              />
            </div>
            <div className="admin-special-field">
              <label>&nbsp;</label>
              <div className="admin-special-toggle">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
                <span>Active</span>
              </div>
              <button type="submit" className="admin-special-submit" disabled={loading}>
                {isEditing ? 'Update' : 'Add'} specialization
              </button>
            </div>
          </form>

          <div className="admin-special-table-wrapper">
            <table className="admin-special-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="admin-special-empty">
                      Loading specializations...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="admin-special-empty">
                      No specializations defined yet.
                    </td>
                  </tr>
                ) : (
                  items.map((spec) => (
                    <tr key={spec.id}>
                      <td>{spec.name}</td>
                      <td>{spec.description || '-'}</td>
                      <td>
                        <span
                          className={`admin-special-status-pill ${
                            spec.is_active ? 'active' : 'inactive'
                          }`}
                        >
                          <span className="admin-special-status-dot" />
                          {spec.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-special-actions">
                          <button
                            type="button"
                            className="admin-special-btn"
                            title="Edit"
                            onClick={() => handleEdit(spec)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-special-btn"
                            title="Delete"
                            onClick={() => handleDelete(spec.id)}
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
          </div>
        </motion.div>

        <div className="admin-special-side">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-special-side-card"
          >
            <h3>How these are used</h3>
            <p>
              Specializations power both doctor onboarding and patient symptom routing. A
              clear list keeps your ecosystem organized and easier to maintain.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-special-side-card"
          >
            <h3>Best practices</h3>
            <p>
              Use concise names (Cardiology, Dermatology) and keep descriptions focused on
              what symptoms or cases each specialization should handle.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SpecializationManagement;


