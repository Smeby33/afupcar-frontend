import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import logoBlanc from '../../logo-blanc.png';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/register');
  };
  return <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      {/* Decorative curved elements */}
      {/* <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-white rounded-bl-[100%] z-0"></div>
      <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-white rounded-tr-[100%] z-0"></div> */}
      {/* Content */}
      <div className="flex flex-col justify-between min-h-screen z-10 p-6" style={{ backdropFilter: 'blur(10px)' }}>
        <div className="mt-20 flex flex-col items-left">
          <h1 className="text-2xl font-bold leading-tight text-left">
            <span className="text-[#3EFEFE]">
              LA VIE EST
              <br />
              COURTE,
            </span>
            <br />
            <span className="text-white">APPUIE SUR</span>
            <br />
            <span className="text-[#3EFEFE]">L'ACCÉLÉRATEUR !</span>
          </h1>
        </div>
        <div className=" flex flex-col items-center " style={{ height: '300px', borderRadius: '20px',marginBottom: '100px',justifyContent: 'center', alignItems: 'center'  }}>

        <img
            src={logoBlanc}
            alt="Logo"
            className="my-10 w-100 h-auto"
          />
        
        </div>

        <div className="mb-20 w-full max-w-md mx-auto">
          <Button onClick={handleGetStarted} icon fullWidth>
            Commencer
          </Button>
        </div>
      </div>
    </div>;
};
export default WelcomePage;