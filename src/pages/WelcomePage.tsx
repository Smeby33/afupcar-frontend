import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import logoBlanc from '../../logo-blanc.png';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div 
      className="min-h-screen bg-black text-white relative overflow-hidden"
      role="main"
      aria-label="Page d'accueil Lotu"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient accents */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#3EFEFE]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#3EFEFE]/10 to-transparent rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(to right, #3EFEFE 1px, transparent 1px),
                             linear-gradient(to bottom, #3EFEFE 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        {/* Header with slogan */}
        <header className="mt-20 md:mt-32">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            <span className="text-[#3EFEFE] block mb-2">
              ROULE VERS L'IMPOSSIBLE,
            </span>
            <span className="text-white block mb-2">
              LA ROUTE
            </span>
            <span className="text-[#3EFEFE] block">
              N'ATTEND QUE TOI !
            </span>
          </h1>
          
       
        </header>

        {/* Logo section */}
        <div 
          className="flex-1 flex flex-col justify-center items-center my-8"
          aria-label="Logo Lotu"
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#3EFEFE]/20 blur-xl rounded-full transform group-hover:scale-110 transition-transform duration-500" />
            
            {/* Logo container */}
              <img
                src={logoBlanc}
                alt="Lotu - Plateforme de location de voitures au Gabon"
                className="w-48 h-auto md:w-64 lg:w-80 transition-transform duration-300 group-hover:scale-105"
                loading="eager"
                width={320}
                height={120}
              />
            
            {/* Tagline under logo */}
            <p className="mt-6 text-center text-gray-300 font-medium">
              Votre liberté sur 4 roues
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <footer className="mb-10 md:mb-16">
          <div className="max-w-md mx-auto space-y-4">
            <Button 
              onClick={handleGetStarted} 
              icon 
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-[#3EFEFE] to-cyan-500 text-black hover:from-cyan-500 hover:to-[#3EFEFE] transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-[#3EFEFE]/20"
              aria-label="Commencer l'inscription sur Lotu"
            >
              <span className="font-semibold text-lg">Commencer l'aventure</span>
            </Button>
            
            {/* Additional info for user */}
            <p className="text-center text-sm text-gray-400">
              Gratuit • Sans engagement • 100% sécurisé
            </p>
            
          
          </div>
        </footer>
      </div>

      {/* Performance optimization: Preload register page */}
      <link rel="prefetch" href="/register" />
    </div>
  );
};

export default WelcomePage;