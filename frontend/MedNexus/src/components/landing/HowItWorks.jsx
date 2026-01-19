import { motion } from 'framer-motion';
import { UserPlus, Search, CalendarCheck, Video, Check } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Create Account',
      description: 'Sign up in seconds with your email or phone number. Your health journey starts here.',
      gradient: 'from-blue-500 to-indigo-500',
      ring: 'ring-blue-500/15',
    },
    {
      icon: Search,
      number: '02',
      title: 'Find Your Doctor',
      description: 'Browse through our network of specialists and find the perfect match for your needs.',
      gradient: 'from-emerald-500 to-teal-500',
      ring: 'ring-emerald-500/15',
    },
    {
      icon: CalendarCheck,
      number: '03',
      title: 'Book Appointment',
      description: 'Choose a convenient time slot and book your consultation instantly.',
      gradient: 'from-purple-500 to-pink-500',
      ring: 'ring-purple-500/15',
    },
    {
      icon: Video,
      number: '04',
      title: 'Start Consultation',
      description: 'Connect with your doctor via video call and get the care you deserve.',
      gradient: 'from-orange-500 to-red-500',
      ring: 'ring-orange-500/15',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-28 sm:py-32 w-full bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute top-24 -right-24 w-[28rem] h-[28rem] bg-teal-200/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-[32rem] h-[32rem] bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center justify-center px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full text-base font-semibold mb-6">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Healthcare Made{' '}
            <span className="text-emerald-500">
              Simple
            </span>
          </h2>
          <p className="text-base text-gray-600" style={{ lineHeight: '1.8' }}>
            Get started with MedNexus in just four easy steps. Quality healthcare is now just a few clicks away.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 sm:mt-20 grid md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="h-full"
            >
              <div className={`group h-full rounded-3xl bg-white/60 ring-1 ring-emerald-500/15 backdrop-blur-sm`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="h-full min-h-[280px] rounded-3xl bg-white shadow-xl shadow-gray-100 border border-gray-100 p-6 pb-10 lg:p-8 lg:pb-12"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: '#10b981' }}>
                      <step.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <span className="text-4xl lg:text-5xl font-extrabold leading-none" style={{ color: '#10b981', opacity: 0.3 }}>
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 lg:mt-7 text-lg lg:text-xl font-bold" style={{ color: '#10b981' }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 lg:mt-3 text-sm lg:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        
      </div>
    </section>
  );
};

export default HowItWorks;
