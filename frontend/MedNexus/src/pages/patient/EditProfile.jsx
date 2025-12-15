import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Scale,
  Ruler,
  Droplets,
  Activity,
  Camera,
  Upload,
  X,
  Save,
  Trash2,
  CheckCircle2,
  Plus,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const API_URL = 'http://localhost:8000';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(
    user?.profile_picture ? getImageUrl(user.profile_picture) : null
  );
  const [currentCondition, setCurrentCondition] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    blood_group: user?.blood_group || '',
    conditions: user?.medical_conditions ? user.medical_conditions.split(', ').filter(Boolean) : [],
  });

  const commonConditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Thyroid',
    'Allergies',
    'Arthritis',
    'Depression',
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const toggleCondition = (condition) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const addCondition = () => {
    if (currentCondition.trim() && !formData.conditions.includes(currentCondition.trim())) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, currentCondition.trim()],
      });
      setCurrentCondition('');
    }
  };

  const removeCondition = (condition) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((c) => c !== condition),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        blood_group: formData.blood_group,
        medical_conditions: formData.conditions.length > 0 ? formData.conditions.join(', ') : null,
      };

      const updatedUser = await ApiService.updateProfile(updateData);

      if (profilePicture) {
        try {
          const userWithPic = await ApiService.uploadProfilePicture(profilePicture);
          updateUser(userWithPic);
        } catch (picError) {
          console.error('Failed to upload profile picture:', picError);
        }
      } else {
        updateUser(updatedUser);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">
                  Med<span className="text-emerald-500">Nexus</span>
                </span>
              </div>
            </div>
            <h1 className="text-base font-semibold text-slate-800">Edit Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">{success}</p>
          </motion.div>
        )}
  <div className="h-8 sm:h-10 !mt-0" />
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Profile Photo</h3>
                  <p className="text-xs text-slate-500">Add a professional photo</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Avatar Preview */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-slate-100">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <User size={48} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  {profilePicturePreview && (
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -bottom-1 -right-1 p-2 bg-white border border-slate-200 text-red-500 rounded-full hover:bg-red-50 hover:border-red-200 transition-all shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Upload Section */}
                <div className="flex-1 w-full">
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Upload size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {profilePicturePreview ? 'Change photo' : 'Upload photo'}
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
  <div className="h-8 sm:h-10 !mt-0" />
          {/* Personal Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Personal Information</h3>
                  <p className="text-xs text-slate-500">Your basic details</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                  <span className="ml-2 text-xs font-normal text-slate-400">(Cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
                />
              </div>
            </div>
          </motion.div>
                    <div className="h-8 sm:h-10 !mt-0" />
          {/* Health Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Health Metrics</h3>
                  <p className="text-xs text-slate-500">Your vital health information</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Age */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-violet-500" />
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Age</label>
                  </div>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="1"
                    max="150"
                    className="w-full px-0 py-1 bg-transparent border-0 border-b-2 border-slate-200 focus:border-violet-500 outline-none text-xl font-semibold text-slate-800 transition-colors"
                    placeholder="25"
                  />
                  <p className="text-xs text-slate-400 mt-1">years</p>
                </div>

                {/* Weight */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale size={16} className="text-violet-500" />
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Weight</label>
                  </div>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="1"
                    max="500"
                    step="0.1"
                    className="w-full px-0 py-1 bg-transparent border-0 border-b-2 border-slate-200 focus:border-violet-500 outline-none text-xl font-semibold text-slate-800 transition-colors"
                    placeholder="70"
                  />
                  <p className="text-xs text-slate-400 mt-1">kg</p>
                </div>

                {/* Height */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler size={16} className="text-violet-500" />
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Height</label>
                  </div>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    required
                    min="30"
                    max="300"
                    step="0.1"
                    className="w-full px-0 py-1 bg-transparent border-0 border-b-2 border-slate-200 focus:border-violet-500 outline-none text-xl font-semibold text-slate-800 transition-colors"
                    placeholder="175"
                  />
                  <p className="text-xs text-slate-400 mt-1">cm</p>
                </div>

                {/* Blood Group */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets size={16} className="text-red-500" />
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Blood</label>
                  </div>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    required
                    className="w-full px-0 py-1 bg-transparent border-0 border-b-2 border-slate-200 focus:border-red-500 outline-none text-xl font-semibold text-slate-800 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="" disabled>-</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">group</p>
                </div>

                {/* BMI */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={16} className="text-emerald-500" />
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">BMI</label>
                  </div>
                  <div className="text-xl font-semibold text-slate-800 py-1 border-b-2 border-transparent">
                    {formData.weight && formData.height
                      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
                      : '-'}
                  </div>
                  <p className="text-xs mt-1">
                    {formData.weight && formData.height ? (
                      (() => {
                        const bmi = formData.weight / Math.pow(formData.height / 100, 2);
                        if (bmi < 18.5) return <span className="text-blue-500 font-medium">Underweight</span>;
                        if (bmi < 25) return <span className="text-emerald-500 font-medium">Normal</span>;
                        if (bmi < 30) return <span className="text-amber-500 font-medium">Overweight</span>;
                        return <span className="text-red-500 font-medium">Obese</span>;
                      })()
                    ) : (
                      <span className="text-slate-400">kg/m²</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
  <div className="h-8 sm:h-10 !mt-0" />
          {/* Medical Conditions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Medical Conditions</h3>
                    <p className="text-xs text-slate-500">Select any existing conditions</p>
                  </div>
                </div>
                {formData.conditions.length > 0 && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {formData.conditions.length} selected
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Common Conditions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {commonConditions.map((condition) => {
                  const isSelected = formData.conditions.includes(condition);
                  return (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className={`relative px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSelected ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        {condition}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Condition Input */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Add other condition</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentCondition}
                    onChange={(e) => setCurrentCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                    placeholder="Type condition and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    disabled={!currentCondition.trim()}
                    className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Selected Custom Conditions */}
              {formData.conditions.filter((c) => !commonConditions.includes(c)).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3">
                  {formData.conditions
                    .filter((c) => !commonConditions.includes(c))
                    .map((condition) => (
                      <span
                        key={condition}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700"
                      >
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeCondition(condition)}
                          className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
  <div className="h-8 sm:h-10 !mt-0" />
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;
