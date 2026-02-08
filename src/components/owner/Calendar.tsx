import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon,EditIcon, TrashIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface CalendarProps {
  carId: string;
}

const Calendar: React.FC<CalendarProps> = ({ carId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showEntretienForm, setShowEntretienForm] = useState<{ open: boolean, date: Date | null }>({ open: false, date: null });
  const [typeEntretient, setTypeEntretient] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [selectedDayEntretiens, setSelectedDayEntretiens] = useState<any[] | null>(null);
  const [editEntretien, setEditEntretien] = useState<any | null>(null);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Trouver les entretiens de ce jour
    const entretiensDuJour = entretiens.filter(e => {
      const entretienDate = new Date(e.date);
      return entretienDate.getDate() === clickedDate.getDate() && entretienDate.getMonth() === clickedDate.getMonth() && entretienDate.getFullYear() === clickedDate.getFullYear();
    });
    if (entretiensDuJour.length > 0) {
      setSelectedDayEntretiens(entretiensDuJour);
    } else {
      setShowEntretienForm({ open: true, date: clickedDate });
    }
  };

  useEffect(() => {
    if (!carId) return;
    axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/entretients/byCar/${carId}`)
      .then(res => {
        setEntretiens(res.data);
        console.log('les donnees  entretiens:', res.data);
      })
      .catch(() => setEntretiens([]));
  }, [carId, currentMonth]);

  const handleEditEntretien = (entretien: any) => {
    setEditEntretien(entretien);
    setTypeEntretient(entretien.typeEntretient);
    setDescription(entretien.description);
    setShowEntretienForm({ open: true, date: new Date(entretien.date) });
  };

  const handleDeleteEntretien = async (id: string) => {
    try {
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/delette/entretient/${id}`);
      toast.success('Entretien supprimé');
      setSelectedDayEntretiens(null);
      // Refresh entretiens
      axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/byCar/${carId}`)
        .then(res => setEntretiens(res.data))
        .catch(() => setEntretiens([]));
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEntretienSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeEntretient || !showEntretienForm.date) {
      toast.error('Type d\'entretien et date requis');
      return;
    }
    setIsSubmitting(true);
    toast.loading(editEntretien ? 'Modification...' : 'Ajout de l\'entretien en cours...');
    try {
      const dateStr = showEntretienForm.date.toISOString().split('T')[0];
      if (editEntretien) {
        await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/entretient/update/${editEntretien.id}`, {
          voiture: carId,
          typeEntretient,
          date: dateStr,
          description,
        });
        toast.dismiss();
        toast.success('✅ Entretien modifié avec succès');
        setEditEntretien(null);
        setSelectedDayEntretiens(null);
      } else {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/addEntretient', {
          voiture: carId,
          typeEntretient,
          date: dateStr,
          description,
        });
        toast.dismiss();
        toast.success('✅ Entretien ajouté avec succès');
      }
      setShowEntretienForm({ open: false, date: null });
      setTypeEntretient('');
      setDescription('');
      // Refetch entretiens pour affichage
      axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/entretients/byCar/${carId}`)
        .then(res => setEntretiens(res.data))
        .catch(() => setEntretiens([]));
    } catch (err) {
      toast.dismiss();
      toast.error(editEntretien ? 'Erreur lors de la modification' : "❌ Erreur lors de l'ajout de l'entretien");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCalendar = () => {
    const days = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const calendar = [];
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    for (let day = 1; day <= days; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      // Trouver tous les entretiens pour ce jour
      const entretiensDuJour = entretiens.filter(e => {
        const entretienDate = new Date(e.date);
        return entretienDate.getDate() === date.getDate() && entretienDate.getMonth() === date.getMonth() && entretienDate.getFullYear() === date.getFullYear();
      });
      // Construire le tooltip
      let tooltip = '';
      if (entretiensDuJour.length > 0) {
        tooltip = entretiensDuJour.map(e => `${e.typeEntretient}${e.description ? ' - ' + e.description : ''}`).join('\n');
      }
      calendar.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-10 w-10 rounded-full flex items-center justify-center relative ${entretiensDuJour.length > 0 ? 'bg-blue-200 text-blue-900 font-bold border-2 border-blue-400' : 'hover:bg-gray-100'}`}
          title={tooltip}
        >
          {day}
          {entretiensDuJour.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>}
        </button>
      );
    }
    return calendar;
  };
 
  const descriptionOptions = [
    { value: '', label: 'Description (optionnelle)' },
    { value: 'Vidange', label: 'Vidange' },
    { value: 'Pneus', label: 'Pneus' },
    { value: 'Freins', label: 'Freins' },
    { value: 'Batterie', label: 'Batterie' },
    { value: 'Révision', label: 'Révision' },
    { value: 'Autre', label: 'Autre' },
  ];

  return <div className="select-none">
    <div className="flex justify-between items-center mb-4">
      <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
        <ChevronLeftIcon size={20} />
      </button>
      <h4 className="font-medium">
        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
      </h4>
      <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
        <ChevronRightIcon size={20} />
      </button>
    </div>
    <div className="grid grid-cols-7 gap-1 mb-2">
      {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => <div key={index} className="h-10 flex items-center justify-center text-sm text-gray-500">{day}</div>)}
    </div>
    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
    {/* Modale d'affichage/édition/suppression des entretiens du jour */}
    {selectedDayEntretiens && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 min-w-[300px] max-w-xs">
          <div className="font-bold mb-2">Entretiens du {selectedDayEntretiens[0] && new Date(selectedDayEntretiens[0].date).toLocaleDateString()}</div>
          <ul className="mb-4">
            {selectedDayEntretiens.map(e => (
              <li key={e.id} className="flex items-center justify-between gap-2 border-b py-2">
                <div>
                  <div className="font-semibold">{e.typeEntretient}</div>
                  <div className="text-xs text-gray-500">{e.description}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditEntretien(e)} title="Modifier" className="text-blue-500 hover:text-blue-700"><EditIcon size={20} /></button>
                  <button onClick={() => handleDeleteEntretien(e.id)} title="Supprimer" className="text-red-500 hover:text-red-700"><TrashIcon size={20} /></button>
                </div>
              </li>
            ))}
          </ul>
          {/* Formulaire d'édition dans la modale */}
          {editEntretien && (
            <form onSubmit={handleEntretienSubmit} className="bg-gray-50 p-3 rounded flex flex-col gap-2 mb-2">
              <div className="text-black font-semibold mb-2">Modifier l'entretien</div>
              <select
                value={typeEntretient}
                onChange={e => setTypeEntretient(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Type d'entretien</option>
                <option value="Horaire">Demi-journée</option>
                <option value="Journalier">Toute la journée</option>
              </select>
              <select
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                {descriptionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={isSubmitting} className="bg-[#3EFEFE] text-black font-bold px-4 py-2 rounded hover:bg-lime-300 transition">Modifier</button>
                <button type="button" onClick={() => { setEditEntretien(null); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">Annuler</button>
              </div>
            </form>
          )}
          <button onClick={() => { setSelectedDayEntretiens(null); setEditEntretien(null); }} className="w-full bg-gray-200 rounded py-1 font-semibold hover:bg-gray-300">Fermer</button>
        </div>
      </div>
    )}
    {/* Formulaire d'ajout d'entretien (hors modale) */}
    {showEntretienForm.open && !editEntretien && (
      <form onSubmit={handleEntretienSubmit} className="mt-4 bg-white p-4 rounded shadow max-w-xs mx-auto flex flex-col gap-2 z-50">
        <div className="text-black font-semibold mb-2">Ajouter un entretien le {showEntretienForm.date?.toLocaleDateString()}</div>
        <select
          value={typeEntretient}
          onChange={e => setTypeEntretient(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">Type d'entretien</option>
          <option value="Horaire">Demi-journée</option>
          <option value="Journalier">Toute la journée</option>
        </select>
        <select
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {descriptionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="flex gap-2 mt-2">
          <button type="submit" disabled={isSubmitting} className="bg-[#3EFEFE] text-black font-bold px-4 py-2 rounded hover:bg-lime-300 transition">Ajouter</button>
          <button type="button" onClick={() => { setShowEntretienForm({ open: false, date: null }); setDescription(''); setEditEntretien(null); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">Annuler</button>
        </div>
      </form>
    )}
  </div>;
};

export default Calendar;