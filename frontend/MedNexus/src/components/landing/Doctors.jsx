import { Star } from 'lucide-react';

const Doctors = () => {
  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: '15+ years',
      rating: 4.9,
      reviews: 234,
      available: true,
      image:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      experience: '12+ years',
      rating: 4.8,
      reviews: 189,
      available: true,
      image:
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Dr. Emily Parker',
      specialty: 'Dermatologist',
      experience: '10+ years',
      rating: 4.9,
      reviews: 312,
      available: false,
      image:
        'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Dr. James Wilson',
      specialty: 'General Physician',
      experience: '20+ years',
      rating: 4.7,
      reviews: 456,
      available: true,
      image:
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    },
  ];

  return (
    <section id="doctors" className="py-24 w-full bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#222', marginBottom: '20px' }}>
            Meet Our Expert Doctors
          </h2>
          <div style={{ width: '80px', height: '3px', backgroundColor: '#10b981', margin: '20px auto' }} />
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
            Our network includes board-certified specialists ready to provide you with world-class medical care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    doctor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {doctor.available ? '● Available Now' : '○ Busy'}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 py-3 bg-white/90 backdrop-blur-sm text-emerald-600 font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                  Book Appointment
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                <p className="text-emerald-600 font-medium text-sm mb-3">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mb-4">{doctor.experience} experience</p>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-gray-900">{doctor.rating}</span>
                  <span className="text-gray-400 text-sm">({doctor.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            className="px-6 py-3 bg-emerald-100 text-emerald-700 text-base font-semibold rounded-full hover:bg-emerald-200 transition-colors"
            type="button"
          >
            View All Doctors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
