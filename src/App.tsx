import React , { useEffect, useState}from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Toaster moved to index.tsx to avoid portal insertion races
import WelcomePage from './pages/WelcomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import SplashScreen from './pages/SplashScreen';
import { CircleIcon } from 'lucide-react';  
import InstallPWAButton from './components/InstallPWAButton';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Admin routes
import AdminLogin from './pages/admin/login'; 
import AdminRegistration from './pages/admin/Registration';
import AdminDashboard from './pages/admin/Dashboard';
// import AdminVehicles from './pages/admin/AdminVehicles';
import AdminOwners from './pages/admin/AdminOwners';
import Garage from './pages/admin/Garage';  
import AdminOwnersDetails from './pages/admin/AdminOwnersDetails';
import AdminRenters from './pages/admin/AdminRenters';
import AdminRenterDetails from './pages/admin/AdminRenterDetails';
import AdminReservations from './pages/admin/AdminReservations';
import ReservationsList from './pages/renter/ReservationsList';
import AdminCar from './pages/admin/AdminCar';
import AdminCarDetails from './pages/admin/AdminCarDetails';
import AdminLegales from './pages/admin/AdminLegales';

// Owner routes
import OwnerLogin from './pages/owner/login';
import OwnerRegistration from './pages/owner/Registration';
import OwnerDashboard from './pages/owner/Dashboard';
import AddVehicle from './pages/owner/AddVehicle';
import ProfileOwner from './pages/owner/Profile';
import LivraisonListPage from './pages/owner/LivraisonList';
import OwnerVehicles from './pages/owner/OwnerVehicles';
import VehicleDetails from './pages/owner/VehicleDetails';
import EditVehicle from './pages/owner/EditVehicle';
import Notifications from './pages/owner/Notifications';
import TextoOwner from './pages/owner/TextoOwner';
import OwnerFeedback from './components/owner/OwnerFeedback';
// Renter routes
import RenterLogin from './pages/renter/login';
import RenterRegistration from './pages/renter/Registration';
import ProfileRenter from './pages/renter/Profile';
import RenterDashboard from './pages/renter/Dashboard';
import VehicleSearch from './pages/renter/VehicleSearch';
import VehicleView from './pages/renter/VehicleView';
import BookingConfirmation from './pages/renter/BookingConfirmation';
import Payment from './pages/renter/Payment';
import PaymentResult from './pages/renter/PaymentResult';
import Notificationsrenter from './pages/renter/Notificationsrenter';
import TextoRenter from './pages/renter/TextoRenter';
import RenterFeedback from './components/renter/RenterFeedback';


export function App() {

const [showSplash, setShowSplash] = useState(true);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [pwaInstallable, setPwaInstallable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <Router>
        {/* Prompt d'installation PWA personnalisé */}
        {pwaInstallable && (
          <PWAInstallPrompt deferredPrompt={deferredPrompt} setPwaInstallable={setPwaInstallable} />
        )}
        {/* Bouton d'installation PWA global (optionnel) */}
        <InstallPWAButton />
      <Routes>
        
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<RoleSelectionPage />} />
        {/* admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegistration />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />}/>
        <Route path='/admin/owners/:id' element={<AdminOwnersDetails />} />
        <Route path="/admin/owners" element={<AdminOwners />} />
        <Route path="/admin/renters" element={<AdminRenters />} />
        <Route path="/admin/renter/:id" element={<AdminRenterDetails />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/admin/cars" element={<AdminCar />} />
        <Route path="/admin/car/:id" element={<AdminCarDetails />} />
        <Route path="/admin/modelecar" element={<Garage />} />
        <Route path="/admin/legales" element={<AdminLegales />} />

        {/* Owner routes */}
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/register" element={<OwnerRegistration />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/add-vehicle" element={<AddVehicle />} />
        <Route path="/owner/profile" element={<ProfileOwner />} />
        <Route path="/owner/vehicle/:id" element={<VehicleDetails />} />
        <Route path="/owner/vehicle/edit/:id" element={<EditVehicle />} />
        <Route path="/owner/vehicle/OwnerVehicles" element={<OwnerVehicles />} />
        <Route path="/owner/livraisons" element={<LivraisonListPage />} />
        <Route path="/owner/notifications" element={<Notifications />} />
        <Route path="/owner/texto/:id" element={<TextoOwner />} />
        <Route path="/owner/feedback/:id" element={<OwnerFeedback />} />
        {/* Renter routes */}
        <Route path="/renter/login" element={<RenterLogin />} />
        <Route path="/renter/register" element={<RenterRegistration />} />
        <Route path="/renter/dashboard" element={<RenterDashboard />} />
        <Route path="/renter/profile" element={<ProfileRenter />} />
        <Route path="/renter/reservations" element={<ReservationsList />} />
        <Route path="/renter/search" element={<VehicleSearch />} />
        <Route path="/renter/vehicle/:id" element={<VehicleView />} />
        <Route path="/renter/booking/:id" element={<BookingConfirmation />} />
        <Route path="/renter/payment/:id" element={<Payment />} />
        <Route path="/renter/payment-result" element={<PaymentResult />} />
        <Route path="/renter/notifications" element={<Notificationsrenter />} />
        <Route path="/renter/texto/:id" element={<TextoRenter />} />
        <Route path="/renter/feedback/:id" element={<RenterFeedback />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>;
}