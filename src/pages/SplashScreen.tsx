import React, { useEffect, useRef } from 'react';
import '../components/css/SplashScreen.css';


const SplashScreen: React.FC = () => {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.style.opacity = '0';
      logoRef.current.style.transition = 'opacity 5s';
      setTimeout(() => {
        if (logoRef.current) logoRef.current.style.opacity = '1';
      }, 50); // Démarre l'animation après le montage
    }
  }, []);

  return (
    <div className="splash-screen bg-black flex items-center justify-center h-screen" style={{ position: 'relative', overflow: 'hidden' , zIndex: 1000 ,  backgroundColor: 'black',}}>
      {/* Utilisation directe du chemin public pour l'image */}
      <img
        ref={logoRef}
        src="/logo 512 - Copie.png"
        alt="Logo"
        style={{
          width: 120,
          height: 120,
          marginBottom: 40,
          opacity: 0
        }}
      />
    </div>
  );
};

export default SplashScreen;


