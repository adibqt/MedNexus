import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Scale, 
  Ruler, 
  FileText, 
  ArrowRight, 
  Plus, 
  X, 
  Droplets,
  Shield,
  Activity,
  User,
  CheckCircle2,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, completeProfile, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    blood_group: '',
    conditions: [],
  });

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

    try {
      // First, complete the profile with health data
      await completeProfile({
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        blood_group: formData.blood_group,
        medical_conditions: formData.conditions.length > 0 ? formData.conditions.join(', ') : null,
      });

      // Then, upload profile picture if one was selected
      if (profilePicture) {
        try {
          const updatedUser = await apiService.uploadProfilePicture(profilePicture);
          updateUser(updatedUser);
        } catch (picError) {
          console.error('Failed to upload profile picture:', picError);
          // Don't fail the whole submission, just log the error
        }
      }

      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

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

  const steps = [
    { id: 1, name: 'Account Created', status: 'complete' },
    { id: 2, name: 'Health Profile', status: 'current' },
    { id: 3, name: 'Dashboard', status: 'upcoming' },
  ];

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
        {/* Gradient Overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/20 via-transparent to-cyan-600/20" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
          <div className="absolute top-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-6">
                Almost there, {user?.name?.split(' ')[0] || 'Friend'}! 🎉
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-10">
                Help us personalize your healthcare experience by sharing a few health details.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              {[
                { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and protected' },
                { icon: Activity, title: 'Personalized Care', desc: 'Get recommendations tailored to you' },
                { icon: User, title: 'Quick Setup', desc: 'Takes less than 2 minutes' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                    <item.icon className="w-5 h-5" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Progress Indicator */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'complete'
                        ? 'bg-emerald-500 text-white'
                        : step.status === 'current'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step.status === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        step.status === 'complete' ? 'bg-emerald-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm">Step 2 of 3 — Health Profile</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Med<span style={{ color: '#10b981' }}>Nexus</span>
              </span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Step 2/3</span>
          </div>
        </div>

        {/* Form Content - Full Width */}
        <div className="min-h-full p-6 sm:p-10 lg:p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Header */}
            <div className="mb-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-700 text-sm font-medium mb-6"
              >
                <Activity className="w-4 h-4" />
                Health Profile Setup
              </motion.div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Let's personalize your
                <span className="block" style={{ color: '#10b981' }}>healthcare experience</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Share a few health details so we can provide personalized recommendations and better care for you.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Something went wrong</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Profile Picture</h3>
                    <p className="text-gray-500">Optional — Add a photo to personalize your account</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Preview */}
                  <div className="relative">
                    <div className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 flex items-center justify-center ${profilePicturePreview ? 'border-emerald-200' : 'border-gray-200 bg-gray-50'}`}>
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 lg:w-20 lg:h-20 text-gray-300" />
                      )}
                    </div>
                    {profilePicturePreview && (
                      <motion.button
                        type="button"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Upload Area */}
                  <div className="flex-1 w-full">
                    <label className="group cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group-hover:shadow-md">
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                          <Upload className="w-7 h-7" />
                        </div>
                        <p className="text-gray-700 font-semibold mb-1">
                          {profilePicturePreview ? 'Change photo' : 'Upload a photo'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          PNG, JPG or WEBP (max 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Basic Info Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                    <p className="text-gray-500">Your vital health metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                  {/* Age */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Age</span>
                      <span className="text-xs text-red-400 font-medium">Required</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 group-focus-within:from-emerald-50 group-focus-within:to-emerald-100 group-focus-within:border-emerald-200 transition-all">
                        <Calendar className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      </div>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="1"
                        max="150"
                        className="w-full pl-18 pr-5 py-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg font-medium bg-white"
                        style={{ paddingLeft: '4.5rem' }}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Weight (kg)</span>
                      <span className="text-xs text-red-400 font-medium">Required</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 group-focus-within:from-emerald-50 group-focus-within:to-emerald-100 group-focus-within:border-emerald-200 transition-all">
                        <Scale className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
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
                        className="w-full pl-18 pr-5 py-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg font-medium bg-white"
                        style={{ paddingLeft: '4.5rem' }}
                        placeholder="70"
                      />
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Height (cm)</span>
                      <span className="text-xs text-red-400 font-medium">Required</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 group-focus-within:from-emerald-50 group-focus-within:to-emerald-100 group-focus-within:border-emerald-200 transition-all">
                        <Ruler className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
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
                        className="w-full pl-18 pr-5 py-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg font-medium bg-white"
                        style={{ paddingLeft: '4.5rem' }}
                        placeholder="175"
                      />
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Blood Group</span>
                      <span className="text-xs text-red-400 font-medium">Required</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 group-focus-within:from-emerald-50 group-focus-within:to-emerald-100 group-focus-within:border-emerald-200 transition-all z-10">
                        <Droplets className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      </div>
                      <select
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        required
                        className="w-full pl-18 pr-12 py-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg font-medium bg-white appearance-none cursor-pointer"
                        style={{ paddingLeft: '4.5rem' }}
                      >
                        <option value="" disabled>Select</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Medical Conditions Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Medical Conditions</h3>
                      <p className="text-gray-500">Optional — Add existing health conditions</p>
                    </div>
                  </div>
                  {formData.conditions.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {formData.conditions.length} condition{formData.conditions.length > 1 ? 's' : ''} selected
                    </motion.div>
                  )}
                </div>

                {/* Quick Add Tags */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-600 mb-4">Quick select common conditions:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {commonConditions.map((condition) => {
                      const isSelected = formData.conditions.includes(condition);
                      return (
                        <motion.button
                          key={condition}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (isSelected) {
                              removeCondition(condition);
                            } else {
                              setFormData({
                                ...formData,
                                conditions: [...formData.conditions, condition],
                              });
                            }
                          }}
                          className={`p-4 text-sm font-medium rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-500/10'
                              : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50 bg-gray-50/50'
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                          {condition}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Input */}
                <div className="relative">
                  <p className="text-sm font-medium text-gray-600 mb-3">Add a custom condition:</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentCondition}
                      onChange={(e) => setCurrentCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      className="w-full pl-6 pr-16 py-5 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg bg-gray-50/50 focus:bg-white"
                      placeholder="Type condition name and press Enter..."
                    />
                    <motion.button
                      type="button"
                      onClick={addCondition}
                      disabled={!currentCondition.trim()}
                      whileHover={{ scale: currentCondition.trim() ? 1.05 : 1 }}
                      whileTap={{ scale: currentCondition.trim() ? 0.95 : 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all disabled:opacity-40"
                      style={{ backgroundColor: currentCondition.trim() ? '#10b981' : '#e5e7eb', color: currentCondition.trim() ? 'white' : '#9ca3af' }}
                    >
                      <Plus className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Selected Custom Conditions */}
                {formData.conditions.filter(c => !commonConditions.includes(c)).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-gray-100"
                  >
                    <p className="text-sm font-medium text-gray-600 mb-3">Custom conditions:</p>
                    <div className="flex flex-wrap gap-3">
                      {formData.conditions
                        .filter(c => !commonConditions.includes(c))
                        .map((condition) => (
                          <motion.span
                            key={condition}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                          >
                            {condition}
                            <button
                              type="button"
                              onClick={() => removeCondition(condition)}
                              className="hover:bg-emerald-200 rounded-full p-1 transition-colors ml-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.span>
                        ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Submit Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-4"
              >
                <div className="text-center lg:text-left">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#10b981' }}>Ready to get started?</h3>
                  <p className="text-gray-500">Your personalized healthcare dashboard awaits.</p>
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  className="w-full lg:w-auto px-12 py-5 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all disabled:opacity-70 shadow-lg shadow-emerald-500/30 hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
