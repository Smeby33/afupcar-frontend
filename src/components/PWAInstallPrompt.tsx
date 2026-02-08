import React from 'react';
import { DownloadIcon, XIcon } from 'lucide-react';

interface PWAInstallPromptProps {
  deferredPrompt: any;
  setPwaInstallable: (val: boolean) => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ deferredPrompt, setPwaInstallable }) => {
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setPwaInstallable(false);
  };
  const handleDismiss = () => {
    setPwaInstallable(false);
  };
  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto w-full max-w-sm bg-white rounded-lg shadow-lg z-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full">
            <DownloadIcon size={20} className="text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium">Installer l'application</h3>
            <p className="text-sm text-gray-600">
              Installez cette application sur votre appareil pour un accès rapide
            </p>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
          <XIcon size={20} />
        </button>
      </div>
      <div className="mt-4 flex space-x-2 justify-end">
        <button onClick={handleDismiss} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
          Pas maintenant
        </button>
        <button onClick={handleInstallClick} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-900">
          Installer
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
