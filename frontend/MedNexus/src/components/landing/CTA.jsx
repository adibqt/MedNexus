import { motion } from 'framer-motion';
import { ArrowRight, Check, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  const features = [
    'Free first consultation',
    'No credit card required',
    'Cancel anytime',
    '24/7 support included',
  ];

  return (
    <section id="free-trial" className="py-24 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {' '}Healthcare Experience?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join over 50,000 patients who have already discovered a better way 
              to access quality healthcare. Your health journey starts here.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth?mode=signup')}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-poppins font-semibold rounded-full shadow-xl flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth?mode=signin')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>

          {/* Right Content - Auth Cards Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 shadow-2xl border border-emerald-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Join MedNexus Today</h3>
                <p className="text-gray-600">Start your health journey in seconds</p>
              </div>

              {/* Sign Up Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 shadow-lg cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">Create Account</h4>
                    <p className="text-gray-500 text-sm">New to MedNexus? Sign up for free</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-500" />
                </div>
              </motion.div>

              {/* Sign In Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate('/auth?mode=signin')}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                    <LogIn className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">Sign In</h4>
                    <p className="text-gray-500 text-sm">Already have an account? Welcome back</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                </div>
              </motion.div>

              <p className="text-center text-gray-500 text-sm mt-6">
                By continuing, you agree to our{' '}
                <a href="#" className="text-emerald-600 hover:underline">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
