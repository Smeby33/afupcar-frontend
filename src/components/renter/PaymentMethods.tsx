import React, { useState, useEffect } from 'react';
import { CreditCardIcon,PencilIcon, SmartphoneIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Interface pour typer une méthode de paiement
interface PaymentMethod {
  id: string;
  type: 'visa' | 'mobile';
  last4: string;
  reseau: string;
  isDefault: boolean;
  expire_date?: string;
  numero?: string;
}

function getReseauLabel(reseau: string) {
  switch (reseau) {
    case 'airtel':
      return 'Airtel Money';
    case 'moov':
      return 'Moov Money';
    case 'orange':
      return 'Orange Money';
    case 'mtn':
      return 'MTN Mobile Money';
    case 'uba':
      return 'UBA';
    case 'orabank':
      return 'Orabank';
    case 'bgfi':
      return 'BGFI';
    case 'ecobank':
      return 'Ecobank';
    case 'bamboo':
      return 'Bamboo';
    default:
      return reseau;
  }
}

const PaymentMethods: React.FC = () => {
  // États pour gérer les méthodes de paiement et le formulaire
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mobile' | 'visa'>('visa'); // Onglet actif
  const [showAddForm, setShowAddForm] = useState(false); // Affichage du formulaire d'ajout

  // États pour les champs du formulaire carte bancaire
  const [newCard, setNewCard] = useState({
    number: '',
    expire_date: '',
    name: '',
    reseau: 'uba' // valeur par défaut
  });

  // États pour les champs du formulaire mobile money
  const [newMobile, setNewMobile] = useState({
    reseau: 'Airtel money', // valeur par défaut
    phone: '',
    fullname: ''
  });

  // État pour gérer l'ID de la méthode à modifier
  const [editId, setEditId] = useState<string | null>(null);

  // États pour préremplir le formulaire lors de la modification
  const [editCard, setEditCard] = useState({
    number: '',
    expire_date: '',
    name: '',
    reseau: 'uba'
  });

  const [editMobile, setEditMobile] = useState({
    reseau: '',
    phone: '',
    fullname: ''
  });

  // Récupération des méthodes de paiement du conducteur connecté
  const fetchPaymentMethods = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/getPaiement/conducteur/${user.uid}`);
      setPaymentMethods(response.data);
      console.log('Payment methods fetched:', response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des méthodes de paiement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Ajout d'une méthode de paiement (carte ou mobile money)
  const handleAddPayment = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // Préparation des données selon le type d'onglet actif
      let data: any = {
        conducteur: user.uid,
        fullname: activeTab === 'visa'
          ? newCard.name
          : newMobile.fullname,
        type: activeTab,
        reseau: activeTab === 'visa' ? newCard.reseau : newMobile.reseau,
        numero: activeTab === 'visa' ? newCard.number : newMobile.phone,
        expire_date: activeTab === 'visa' ? newCard.expire_date : null
      };

      // Appel à l'API pour ajouter le paiement
      await axios.post(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/addPaiement`, data);

      toast.success('Méthode de paiement ajoutée avec succès');
      setShowAddForm(false);
      setNewCard({ number: '', expire_date: '', name: '' });
      setNewMobile({ reseau: '', phone: '' });

      // Recharge la liste après ajout
      const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/getPaiement/conducteur/${user.uid}`);
      setPaymentMethods(response.data);
      console.log('Payment methods after addition:', response.data);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du paiement');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une méthode de paiement
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/delettePaiement/${id}`);
      toast.success('Méthode de paiement supprimée');
      // Recharge la liste après suppression
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/getPaiement/conducteur/${user.uid}`);
        setPaymentMethods(response.data);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Définir une méthode de paiement comme "par défaut"
  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/payments/default`, {
        userId: getAuth().currentUser?.uid,
        paymentId: id
      });
      toast.success('Méthode de paiement définie par défaut');
      // Recharge la liste après modification
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/getPaiement/conducteur/${user.uid}`);
        setPaymentMethods(response.data);
      }
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  // Modification d'une méthode de paiement
  const handleEditPayment = async (type: 'visa' | 'mobile') => {
    try {
      setLoading(true);
      let data;
      if (type === 'visa') {
        data = {
          reseau: editCard.reseau,
          numero: editCard.number,
          expire_date: editCard.expire_date,
          fullname: editCard.name,
          type: 'visa'
        };
      } else {
        data = {
          reseau: editMobile.reseau,
          numero: editMobile.phone,
          fullname: editMobile.fullname,
          type: 'mobile'
        };
      }
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/updatePaiement/${editId}`, data);
      toast.success('Méthode de paiement modifiée');
      console.log('Payment method updated:', data);
      setEditId(null);
      await fetchPaymentMethods();
    } catch (error) {
        console.error('Error updating payment method:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  // Filtre les méthodes selon l'onglet actif
  const filteredMethods = paymentMethods.filter(method =>
    activeTab === 'visa' ? method.type === 'visa' : method.type === 'mobile'
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* En-tête et bouton d'ajout */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Méthodes de paiement</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#3EFEFE] text-black font-semibold shadow-sm hover:bg-[#eaff8b] hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE]"
        >
          <PlusIcon className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      {/* Onglets pour choisir le type de paiement */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('visa')}
          className={`flex-1 py-3 font-medium ${activeTab === 'visa' ? 'text-black border-b-2 border-[#3EFEFE]' : 'text-gray-500'}`}
        >                 
          <CreditCardIcon className="inline mr-2" /> 
          Cartes bancaires
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex-1 py-3 font-medium ${activeTab === 'mobile' ? 'text-black border-b-2 border-[#3EFEFE]' : 'text-gray-500'}`}
        >
          <SmartphoneIcon className="inline mr-2" />
          Mobile Money
        </button>
      </div>

      {/* Formulaire d'ajout de paiement */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">
            Ajouter une {activeTab === 'visa' ? 'carte bancaire' : 'méthode Mobile Money'}
          </h3>
          {activeTab === 'visa' ? (
            // Formulaire carte bancaire
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de carte</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full p-2 border rounded"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date d'expiration</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full p-2 border rounded"
                    value={newCard.expire_date}
                    onChange={(e) => setNewCard({ ...newCard, expire_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom sur la carte</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-2 border rounded"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPayment}
                  className="bg-[#3EFEFE] hover:bg-[#c0e639] text-black px-4 py-2 rounded"
                  disabled={!newCard.number || !newCard.expire_date || !newCard.name}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            // Formulaire mobile money
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Opérateur</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newMobile.reseau}
                  onChange={(e) => setNewMobile({ ...newMobile, reseau: e.target.value })}
                >
                  <option value="moov">Moov Money</option>
                  <option value="airtel">Airtel Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
                <input
                  type="text"
                  placeholder="077 123 452"
                  className="w-full p-2 border rounded"
                  value={newMobile.phone}
                  onChange={(e) => setNewMobile({ ...newMobile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  placeholder="Nom complet"
                  className="w-full p-2 border rounded"
                  value={newMobile.fullname}
                  onChange={e => setNewMobile({ ...newMobile, fullname: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPayment}
                  className="bg-[#3EFEFE] hover:bg-[#c0e639] text-black px-4 py-2 rounded"
                  disabled={!newMobile.phone}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulaire de modification de paiement */}
      {editId && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">
            Modifier {activeTab === 'visa' ? 'la carte bancaire' : 'la méthode Mobile Money'}
          </h3>
          {activeTab === 'visa' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Banque</label>
                <select
                  className="w-full p-2 border rounded"
                  value={editCard.reseau}
                  onChange={e => setEditCard({ ...editCard, reseau: e.target.value })}
                >
                  <option value="uba">UBA</option>
                  <option value="orabank">Orabank</option>
                  <option value="bgfi">BGFI</option>
                  <option value="ecobank">Ecobank</option>
                  <option value="bamboo">Bamboo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de carte</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editCard.number}
                  onChange={e => setEditCard({ ...editCard, number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date d'expiration</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editCard.expire_date}
                  onChange={e => setEditCard({ ...editCard, expire_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom sur la carte</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editCard.name}
                  onChange={e => setEditCard({ ...editCard, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleEditPayment('visa')}
                  className="bg-[#3EFEFE] hover:bg-[#c0e639] text-black px-4 py-2 rounded"
                  disabled={!editCard.number || !editCard.expire_date || !editCard.name}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Opérateur</label>
                <select
                  className="w-full p-2 border rounded"
                  value={editMobile.reseau}
                  onChange={e => setEditMobile({ ...editMobile, reseau: e.target.value })}
                >
                  <option value="airtel">Airtel Money</option>
                  <option value="moov">Moov Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editMobile.phone}
                  onChange={e => setEditMobile({ ...editMobile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editMobile.fullname}
                  onChange={e => setEditMobile({ ...editMobile, fullname: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleEditPayment('mobile')}
                  className="bg-[#3EFEFE] hover:bg-[#c0e639] text-black px-4 py-2 rounded"
                  disabled={!editMobile.phone}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Affichage des méthodes de paiement */}
      {loading ? (
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      ) : filteredMethods.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Aucune {activeTab === 'visa' ? 'carte bancaire' : 'méthode Mobile Money'} enregistrée
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMethods.map((method) => (
            <div key={method.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Icône selon le type */}
                {method.type === 'visa' ? (
                  <CreditCardIcon className="h-8 w-8 text-blue-500" />
                ) : (
                  <SmartphoneIcon className="h-8 w-8 text-green-500" />
                )}
                <div>
                  <p className="font-medium">
                    {method.type === 'visa'
                      ? `Carte ${getReseauLabel(method.reseau)} ••••`
                      : getReseauLabel(method.reseau)}
                  </p>
                  {/* Affiche la date d'expiration ou le numéro selon le type */}
                  {method.type === 'visa' && method.expire_date && (
                    <p className="text-sm text-gray-500">{method.expire_date}</p>
                  )}
                  {method.type === 'mobile' && method.numero && (
                    <p className="text-sm text-gray-500">{method.numero}</p>
                  )}
                  {/* Affiche le nom complet pour mobile money */}
                  {method.type === 'mobile' && method.fullname && (
                    <p className="text-sm text-gray-700">{method.fullname}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Badge "par défaut" ou bouton pour définir par défaut */}
                {method.isDefault ? (
                  <span className="text-xs bg-[#3EFEFE] text-black px-2 py-1 rounded-full">
                    Par défaut
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-xs text-black hover:underline"
                  >
                    Définir Par défaut
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditId(method.id);
                    if (method.type === 'visa') {
                      setEditCard({
                        number: method.numero || '',
                        expire_date: method.expire_date || '',
                        name: method.fullname || '',
                        reseau: method.reseau || 'uba'
                      });
                    } else {
                      setEditMobile({
                        reseau: method.reseau || '',
                        phone: method.numero || '',
                        fullname: method.fullname || ''
                      });
                    }
                    setShowAddForm(false);
                  }}
                  className="text-blue-500 hover:underline text-xs"
                  title="Modifier"
                >
                 <PencilIcon className="w-4 h-4" />
                
                </button>
                {/* Bouton de suppression */}
                <button
                  onClick={() => handleDelete(method.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;