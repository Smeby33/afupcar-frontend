import React, { useState } from 'react';

const tabs = [
  { key: 'front', label: 'Avant' },
  { key: 'rear', label: 'Arrière' },
  { key: 'left', label: 'Gauche' },
  { key: 'right', label: 'Droite' },
];

interface BerlineExteriorInspectorProps {
  checked: { [key: string]: boolean };
  onChange: (id: string) => void;
}

const tooltips = {
  front_body: 'Carrosserie avant',
  front_left_wheel: 'Roue avant gauche',
  front_right_wheel: 'Roue avant droite',
  rear_body: 'Carrosserie arrière',
  rear_left_wheel: 'Roue arrière gauche',
  rear_right_wheel: 'Roue arrière droite',
  left_body: 'Côté gauche',
  left_front_wheel: 'Roue avant gauche',
  left_rear_wheel: 'Roue arrière gauche',
  right_body: 'Côté droit',
  right_front_wheel: 'Roue avant droite',
  right_rear_wheel: 'Roue arrière droite',
};

const checklistLabels = {
  front: [
    { id: 'front_body', label: 'Carrosserie avant' },
    { id: 'front_left_wheel', label: 'Roue avant gauche' },
    { id: 'front_right_wheel', label: 'Roue avant droite' },
  ],
  rear: [
    { id: 'rear_body', label: 'Carrosserie arrière' },
    { id: 'rear_left_wheel', label: 'Roue arrière gauche' },
    { id: 'rear_right_wheel', label: 'Roue arrière droite' },
  ],
  left: [
    { id: 'left_body', label: 'Côté gauche' },
    { id: 'left_front_wheel', label: 'Roue avant gauche' },
    { id: 'left_rear_wheel', label: 'Roue arrière gauche' },
  ],
  right: [
    { id: 'right_body', label: 'Côté droit' },
    { id: 'right_front_wheel', label: 'Roue avant droite' },
    { id: 'right_rear_wheel', label: 'Roue arrière droite' },
  ],
};

const BerlineExteriorInspector: React.FC<BerlineExteriorInspectorProps> = ({ checked, onChange }) => {
  const [tab, setTab] = useState<'front' | 'rear' | 'left' | 'right'>('front');

  const handleZoneClick = (id: string) => {
    onChange(id);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 justify-center">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'front' | 'rear' | 'left' | 'right')}
            className={`px-4 py-2 rounded-t font-bold border-b-2 ${tab === t.key ? 'bg-[#3EFEFE] border-[#3EFEFE] text-black' : 'bg-gray-200 border-transparent text-gray-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div>{/* svgViews[tab]({ onZoneClick: handleZoneClick, checked, tooltips }) */}</div>
        <div className="flex-1 max-h-64 overflow-y-auto bg-white rounded-lg shadow p-4">
          <div className="font-bold mb-2 text-gray-800">Vérification {tabs.find(t => t.key === tab)?.label}</div>
          <ul className="space-y-2">
            {checklistLabels[tab].map(item => (
              <li key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={!!checked[item.id]}
                  onChange={() => handleZoneClick(item.id)}
                  className="accent-[#3EFEFE] w-4 h-4"
                />
                <label htmlFor={item.id} className="text-gray-700 cursor-pointer">{item.label}</label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BerlineExteriorInspector;
