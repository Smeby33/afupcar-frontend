
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon,EditIcon, BellIcon, ClockIcon, StarIcon ,LayoutDashboardIcon, BarChart3Icon, PlusCircleIcon, UserIcon, LogOutIcon, SettingsIcon, TruckIcon, ChevronLeft,HeadsetIcon, Trash2Icon } from 'lucide-react';
import Conversationsrenter from './Conversations';
import RenterFeedback from './RenterFeedback';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  reading: number;
}


const NotificationsListrenter: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      fetchNotifications(user.uid);
    }
  }, []);

  const fetchNotifications = async (uid: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/getNotifications/${uid}`);
      setNotifications(res.data);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      await axios.patch(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/markAsRead/${notifId}`);
      if (userId) fetchNotifications(userId);
    } catch (err) {
      // Optionnel: toast erreur
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await axios.patch(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/markAllRead/${userId}`);
      fetchNotifications(userId);
    } catch (err) {
      // Optionnel: toast erreur
    }
  };

  const deleteNotification = async (notifId: string) => {
    try {
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/delete/${notifId}`);
      if (userId) fetchNotifications(userId);
    } catch (err) {
      // Optionnel: toast erreur
    }
  };

  // Calcul du nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.reading).length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 relative">
        <span className="relative inline-block">
          <BellIcon className="w-7 h-7 text-yellow-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">{unreadCount}</span>
          )}
        </span>
        Notifications
        <button
          className="ml-auto px-3 py-1 bg-yellow-400 text-black rounded text-xs font-bold hover:bg-yellow-500"
          onClick={markAllAsRead}
          disabled={loading || notifications.length === 0}
        >
          Tout marquer comme lu
        </button>
      </h1>
      {loading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500">Aucune notification.</div>
      ) : (
        <div className="space-y-3 max-h-[100vh] overflow-y-auto pr-2">
          <ul>
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-4 rounded shadow flex flex-col bg-white border-l-4 ${notif.reading ? 'border-gray-200' : 'border-yellow-400'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{notif.title}</span>
                  <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <div className="text-gray-700 mt-1">{notif.message}</div>
                <div className="flex gap-2 mt-2">
                  {!notif.reading && (
                    <button
                      className="text-xs text-yellow-600 font-bold hover:underline"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <Trash2Icon className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Notificationsrenter: React.FC = () => {
  const [tab, setTab] = useState<'notifs' | 'conversations' | 'feedback'>('notifs');
  const navigate = useNavigate();

  return (
    <div>
      <header className="md:hidden bg-gray-100 shadow sticky top-0 z-40 p-2 flex items-center justify-between">
        <button
          className="p-2 rounded hover:bg-gray-200 transition"
          aria-label="Retour"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex gap-2 mt-2 justify-end flex-1">
          <button
            className={`px-4 py-2 rounded-t flex font-semibold border-b-2 ${tab === 'notifs' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setTab('notifs')}
          >
            <BellIcon className="w-7 h-7 text-black" />
            
          
          </button>
          <button
            className={`px-4 py-2 rounded-t flex font-semibold border-b-2 ${tab === 'conversations' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setTab('conversations')}
          >
            <EditIcon className="w-7 h-7 text-black" />
          
          </button>
          <button
            className={`px-4 py-2 rounded-t flex font-semibold border-b-2 ${tab === 'feedback' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setTab('feedback')}
          >
            <HeadsetIcon className="w-7 h-7 text-black" />
          
          </button>
        </div>
      </header>
      <div>
        {(() => {
          switch (tab) {
            case 'notifs':
              return <NotificationsListrenter />;
            case 'conversations':
              return <Conversationsrenter />;
            case 'feedback':
              return <RenterFeedback />;
            default:
              return null;
          }
        })()}
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
              <div className="flex justify-around p-3">
                <button  onClick={() => navigate('/renter/dashboard')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
                  <LayoutDashboardIcon size={18} />
                  <span className="text-xs font-semibold">Dashboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
                  onClick={() => navigate('/renter/search')}>
                  <CarIcon size={18} />
                  <span className="text-xs">Recherche</span>
                </button>
                <button onClick={() => navigate('/renter/reservations')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
                  <ClockIcon size={18} />
                  <span className="text-xs">Réservations</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
                  onClick={() => navigate('/renter/profile')}
                >
                  <UserIcon size={18} />
                  <span className="text-xs">Profil</span>
                </button>
              </div>
            </nav>
    </div>
  );
};

export default Notificationsrenter;
