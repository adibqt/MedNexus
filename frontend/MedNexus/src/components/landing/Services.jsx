import { motion } from 'framer-motion';
import { 
  Video, 
  MessageCircle, 
  FileText, 
  Pill, 
  Brain, 
  Heart,
  Stethoscope,
  Calendar
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Video,
      title: 'Video Consultation',
      description: 'Connect face-to-face with certified doctors through secure HD video calls from anywhere.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: MessageCircle,
      title: 'Chat with Doctor',
      description: 'Send messages, photos, and documents to your doctor for quick medical advice.',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Brain,
      title: 'AI Symptom Checker',
      description: 'Get instant preliminary diagnosis using our advanced AI-powered symptom analyzer.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Receive prescriptions digitally and get medications delivered to your doorstep.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Pill,
      title: 'Medicine Delivery',
      description: 'Order prescribed medicines online with same-day delivery options available.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments at your convenience with our smart scheduling system.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Heart,
      title: 'Health Monitoring',
      description: 'Track vital signs and health metrics with wearable device integration.',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: Stethoscope,
      title: 'Specialist Care',
      description: 'Access specialists across 50+ medical fields without referral hassles.',
      color: 'from-teal-500 to-green-500',
      bgColor: 'bg-teal-50',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="services" className="py-24 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Healthcare
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              {' '}at Your Fingertips
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Experience the future of healthcare with our wide range of telemedicine 
            services designed to meet all your medical needs.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${service.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`w-7 h-7 bg-gradient-to-r ${service.color} bg-clip-text text-transparent`} 
                  style={{ 
                    stroke: `url(#gradient-${index})`,
                  }}
                />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={service.color.includes('blue') ? '#3b82f6' : 
                        service.color.includes('emerald') ? '#10b981' :
                        service.color.includes('purple') ? '#8b5cf6' :
                        service.color.includes('orange') ? '#f97316' :
                        service.color.includes('pink') ? '#ec4899' :
                        service.color.includes('indigo') ? '#6366f1' :
                        service.color.includes('red') ? '#ef4444' :
                        '#14b8a6'
                      } />
                      <stop offset="100%" stopColor={service.color.includes('cyan') ? '#06b6d4' :
                        service.color.includes('teal') ? '#14b8a6' :
                        service.color.includes('pink') ? '#ec4899' :
                        service.color.includes('red') ? '#ef4444' :
                        service.color.includes('rose') ? '#f43f5e' :
                        service.color.includes('purple') ? '#a855f7' :
                        service.color.includes('green') ? '#22c55e' :
                        '#06b6d4'
                      } />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
