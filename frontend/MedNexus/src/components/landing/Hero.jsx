import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, Shield, Clock, Video, CheckCircle } from 'lucide-react';

const Hero = () => {
  const stats = [
    { number: '50K+', label: 'Happy Patients' },
    { number: '200+', label: 'Expert Doctors' },
    { number: '99%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Available Support' },
  ];

  const features = [
    'Board-certified doctors',
    'Same-day appointments', 
    'Secure & HIPAA compliant',
  ];

  const avatars = [
    '/avatars/user-1.svg',
    '/avatars/user-2.svg',
    '/avatars/user-3.svg',
    '/avatars/user-4.svg',
  ];

  return (
    <section className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-3xl" />
      </div>

      {/* Main Content - uses flexbox to vertically center */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center py-20 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2" />
              <span className="text-emerald-300 text-sm font-medium">
                #1 Telemedicine Platform in 2025
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Your Health,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Reimagined
              </span>
              <br />
              with AI-Powered Care
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-400 mb-6 max-w-lg mx-auto lg:mx-0"
            >
              Connect with world-class doctors instantly. Get diagnosed, treated, 
              and feel better—all from the comfort of your home.
            </motion.p>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-poppins font-semibold rounded-full shadow-2xl shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="flex" style={{ marginLeft: '-12px' }}>
                  {avatars.map((src, idx) => (
                    <img
                      key={src}
                      src={src}
                      alt={`User ${idx + 1}`}
                      className="w-10 h-10 rounded-full border-2 border-slate-800 object-cover bg-slate-700"
                      style={{ marginLeft: idx > 0 ? '-12px' : '0' }}
                      loading="lazy"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-400">4.9 from 10K+ reviews</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image/Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md lg:max-w-lg">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
              >
                {/* Video Call Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl overflow-hidden mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 bg-emerald-500/90 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/30"
                    >
                      <Video className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  {/* Doctor Image Placeholder */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full" />
                    <div>
                      <p className="text-white text-sm font-medium">Dr. Sarah Johnson</p>
                      <p className="text-emerald-300 text-xs">Cardiologist</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Shield, label: 'HIPAA Secure' },
                    { icon: Clock, label: '24/7 Available' },
                    { icon: Video, label: 'HD Video Call' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <item.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-4 right-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl shadow-xl"
              >
                
              </motion.div>

              
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                {stat.number}
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
