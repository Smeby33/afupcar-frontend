import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import axios from 'axios';

interface CalendarProps {
  carId: string;
}

const CalendarRenter: React.FC<CalendarProps> = ({ carId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [selectedDayEntretiens, setSelectedDayEntretiens] = useState<any[] | null>(null);

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
    {/* Modale d'affichage des entretiens du jour */}
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
              </li>
            ))}
          </ul>
          <button onClick={() => { setSelectedDayEntretiens(null); }} className="w-full bg-gray-200 rounded py-1 font-semibold hover:bg-gray-300">Fermer</button>
        </div>
      </div>
    )}
  </div>;
};

export default CalendarRenter;