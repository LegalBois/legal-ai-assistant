import { Scale } from 'lucide-react'

export default function LawyersLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-navy-950 to-navy-900">
      <header className="bg-navy-900">
        <div className="container mx-auto px-3 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Scale className="h-6 w-6 text-amber-400" />
            <span className="text-xl font-bold text-white">LegalBois</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-950/90 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80')" }}
          />

          <div className="container mx-auto px-4 text-center relative z-20">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text leading-tight">
                Expert Legal Solutions for Your Needs
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-300 leading-relaxed">
                We provide comprehensive legal services to protect your rights and interests.
              </p>
              <button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy-900 py-3 px-6 rounded-full font-semibold text-md transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25">
                Schedule a Consultation
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}