import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';

const VIEWS = [
  { key: 'front', label: 'Avant', img: '/voiture-berline-devant.jpg' },
  { key: 'rear', label: 'Arrière', img: '/voiture-berline-derrière.jpg' },
  { key: 'left', label: 'Gauche', img: '/voiture-berline-gauche.jpg' },
  { key: 'right', label: 'Droite', img: '/voiture-berline-droit.jpg' },
];

type ViewKey = 'front' | 'rear' | 'left' | 'right';

type BerlineCanvasInspectorHandle = {
  getAllImages: () => Promise<{ [key in ViewKey]: string }>
};

const BerlineCanvasInspector = forwardRef<BerlineCanvasInspectorHandle>((props, ref) => {
  const [tab, setTab] = useState<ViewKey>('front');
  const canvasRefs = {
    front: useRef<HTMLCanvasElement>(null),
    rear: useRef<HTMLCanvasElement>(null),
    left: useRef<HTMLCanvasElement>(null),
    right: useRef<HTMLCanvasElement>(null),
  };
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState<{ [key in ViewKey]: boolean }>({ front: false, rear: false, left: false, right: false });
  const [drawHistory, setDrawHistory] = useState<{ [key in ViewKey]: ImageData | null }>({ front: null, rear: null, left: null, right: null });
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 220 });

  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < 640;
      setCanvasSize({
        width: isMobile ? window.innerWidth - 32 : 600,
        height: isMobile ? Math.round((window.innerWidth - 32) * 0.45) : 220,
      });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Charge l'image et restaure le dessin pour chaque canvas affiché
  useEffect(() => {
    const canvas = canvasRefs[tab].current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const img = new window.Image();
    img.src = VIEWS.find(v => v.key === tab)?.img || '';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (drawHistory[tab]) ctx.putImageData(drawHistory[tab], 0, 0);
      setImgLoaded(prev => ({ ...prev, [tab]: true }));
    };
  }, [tab, canvasSize.width, canvasSize.height, drawHistory]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setLastPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || !lastPos) return;
    const canvas = canvasRefs[tab].current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPos({ x, y });
  }, [drawing, lastPos, tab]);

  const handlePointerUp = useCallback(() => {
    setDrawing(false);
    setLastPos(null);
    const canvas = canvasRefs[tab].current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    setDrawHistory(prev => ({ ...prev, [tab]: ctx.getImageData(0, 0, canvas.width, canvas.height) }));
  }, [tab]);

  const handleClear = () => {
    setImgLoaded(prev => ({ ...prev, [tab]: false }));
    setDrawHistory(prev => ({ ...prev, [tab]: null }));
  };

  useImperativeHandle(ref, () => ({
    getAllImages: async () => {
      const result: { [key in ViewKey]: string } = { front: '', rear: '', left: '', right: '' };
      for (const v of VIEWS) {
        const canvas = canvasRefs[v.key].current;
        if (canvas) {
          result[v.key] = canvas.toDataURL('image/png');
        }
      }
      return result;
    },
    setTab: (key: ViewKey) => setTab(key),
  }), [canvasRefs]);

  return (
    <div>
      <div className="flex gap-2 mb-2 justify-center flex-wrap">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setTab(v.key as ViewKey)}
            className={`px-4 py-2 rounded-t font-bold border-b-2 text-sm sm:text-base ${tab === v.key ? 'bg-[#3EFEFE] border-[#3EFEFE] text-black' : 'bg-gray-200 border-transparent text-gray-600'}`}
            style={{ minWidth: 70 }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {VIEWS.map(v => (
          <canvas
            key={v.key}
            ref={canvasRefs[v.key]}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              display: tab === v.key ? 'block' : 'none',
              maxWidth: '100%',
              border: '2px solid #888',
              borderRadius: 8,
              touchAction: 'none',
              background: '#fff',
              margin: '0 auto',
            }}
            onPointerDown={tab === v.key ? handlePointerDown : undefined}
            onPointerMove={tab === v.key ? handlePointerMove : undefined}
            onPointerUp={tab === v.key ? handlePointerUp : undefined}
            onPointerLeave={tab === v.key ? handlePointerUp : undefined}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2 justify-center">
        <button onClick={handleClear} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-base">Effacer</button>
      </div>
    </div>
  );
});

export default BerlineCanvasInspector;
export type { BerlineCanvasInspectorHandle };
