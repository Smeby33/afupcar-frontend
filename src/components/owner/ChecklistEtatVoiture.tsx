import React, { useState, useRef } from 'react';
import BerlineCanvasInspector, { BerlineCanvasInspectorHandle } from './BerlineCanvasInspector';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const checklistData = [
	{
		category: 'Extérieur',
		items: [
			'Rayures, bosses, fissures',
			'État de la peinture',
			'Feux avant/arrière, clignotants',
			'Rétroviseurs',
			'Pare-brise et vitres (fissures, impacts)',
			'Pneus (usure, pression, crevaison)',
			'Jantes',
			// Synchronisation avec SVG (ids)
			'front_body',
			'front_left_wheel',
			'front_right_wheel',
			'rear_body',
			'rear_left_wheel',
			'rear_right_wheel',
			'left_body',
			'left_front_wheel',
			'left_rear_wheel',
			'right_body',
			'right_front_wheel',
			'right_rear_wheel',
		],
	},
	{
		category: 'Intérieur',
		items: [
			'Sièges (propreté, déchirures)',
			'Tableau de bord (fonctionnement des voyants)',
			'Volant, pédales',
			'Ceintures de sécurité',
			'Moquette / Tapis',
			'État du coffre',
			"Présence et état de l'autoradio",
			"Climatisation / Chauffage",
			"GPS",
		],
	},
	{
		category: 'Fonctionnalités',
		items: [
			'Klaxon',
			'Essuie-glaces, lave-glace',
			'Clé/Carte de démarrage',
			'Éclairage intérieur',
			'Fermeture centralisée',
			'Vitres électriques',
		],
	},
	{
		category: 'Niveaux & mécaniques',
		items: [
			'Niveau de carburant',
			'Niveau d’huile moteur',
			'Liquide de refroidissement',
			'Freins (si test sur route)',
			'Batterie (voyants ou test si doute)',
		],
	},
	{
		category: 'Accessoires fournis',
		items: [
			'Roue de secours / Kit anti-crevaison',
			'Gilet de sécurité & triangle',
			'Câble USB / GPS',
			'Trousse de premiers secours',
			'Siège bébé (si inclus)',
		],
	},
];

interface ChecklistEtatVoitureProps {
	idReservation: string;
	onChange?: (checked: { [key: string]: boolean }) => void;
	onPdfReady?: (pdfUrl: string) => void; // Ajout du callback pour transmettre le lien Cloudinary
	fullnameConducteur?: string; // Ajout du nom du conducteur
}

const svgZoneLabels: { [key: string]: string } = {
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

const VIEWS = [
	{ key: 'front', label: 'Avant', img: '/voiture-berline-devant.jpg' },
	{ key: 'rear', label: 'Arrière', img: '/voiture-berline-derrière.jpg' },
	{ key: 'left', label: 'Gauche', img: '/voiture-berline-gauche.jpg' },
	{ key: 'right', label: 'Droite', img: '/voiture-berline-droit.jpg' },
];

const getAllItems = () => {
	const all: { [key: string]: string } = {};
	checklistData.forEach(section => {
		section.items.forEach(item => {
			all[item] = section.category;
		});
	});
	return all;
};

const canvasSize = { width: 600, height: 220 };

const ChecklistEtatVoiture: React.FC<ChecklistEtatVoitureProps> = ({ idReservation, onChange, onPdfReady, fullnameConducteur }) => {
	// Initialiser toutes les cases à true
	const allItems = getAllItems();
	const [checked, setChecked] = useState<{ [key: string]: boolean }>(
		Object.keys(allItems).reduce((acc, key) => ({ ...acc, [key]: true }), {})
	);
	const [message, setMessage] = useState<string|null>(null);
	const canvasRef = useRef<BerlineCanvasInspectorHandle>(null);
	const [pdfUrl, setPdfUrl] = useState<string|null>(null);
	const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string|null>(null);
	const [pdfLoading, setPdfLoading] = useState(false);
	const [previewImages, setPreviewImages] = useState<{ [key: string]: string }>({});
	const previewRef = useRef<HTMLDivElement>(null);
	const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
	const [pdfReadyForUpload, setPdfReadyForUpload] = useState(false);
	const [pdfFileName, setPdfFileName] = useState('verification.pdf');

	const handleCheck = (item: string) => {
		setChecked(prev => {
			const updated = { ...prev, [item]: !prev[item] };
			if (onChange) onChange(updated);
			return updated;
		});
	};

	// Générer le texte à envoyer (catégorisé)
	const getUncheckedText = () => {
		const uncheckedByCategory: { [cat: string]: string[] } = {};
		Object.entries(checked).forEach(([item, isChecked]) => {
			if (!isChecked) {
				const cat = allItems[item] || 'Autre';
				if (!uncheckedByCategory[cat]) uncheckedByCategory[cat] = [];
				uncheckedByCategory[cat].push(svgZoneLabels[item] || item);
			}
		});
		let txt = '';
		Object.entries(uncheckedByCategory).forEach(([cat, items]) => {
			txt += `\n${cat} :\n- ${items.join('\n- ')}`;
		});
		return txt.trim();
	};

	// Détecter si une image a été annotée (différente de l'image d'origine)
	const isAnnotated = async (imgDataUrl: string, key: string) => {
		// On compare la dataURL du canvas avec celle de l'image d'origine (sans annotation)
		const img = new window.Image();
		img.src = VIEWS.find(v => v.key === key)?.img || '';
		await new Promise(res => { img.onload = res; });
		const offCanvas = document.createElement('canvas');
		offCanvas.width = canvasSize.width;
		offCanvas.height = canvasSize.height;
		const ctx = offCanvas.getContext('2d');
		if (!ctx) return false;
		ctx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
		const baseData = offCanvas.toDataURL('image/png');
		return baseData !== imgDataUrl;
	};

	// Aperçu HTML à capturer (images annotées seulement, tableau 2x2)
	const [annotatedKeys, setAnnotatedKeys] = useState<string[]>([]);
	// Fonction utilitaire pour uploader un fichier PDF sur Cloudinary et obtenir l'URL (comme dans Profile)
	async function uploadPdfToCloudinary(pdfBlob: Blob): Promise<string> {
		const formData = new FormData();
		formData.append('file', pdfBlob, 'rapport-etat-vehicule.pdf');
		formData.append('upload_preset', 'Lotu_auto');
		const res = await fetch('https://api.cloudinary.com/v1_1/dubsfeixa/auto/upload', {
			method: 'POST',
			body: formData,
		});
		if (!res.ok) throw new Error('Erreur upload Cloudinary');
		const data = await res.json();
		return data.secure_url;
	}
	const handlePreviewPDF = async () => {
		if (!canvasRef.current) return;
		setPdfLoading(true);
		setMessage(null);
		const images = await canvasRef.current.getAllImages();
		const keys: string[] = [];
		for (const key of ['front','rear','left','right']) {
			if (images[key] && await isAnnotated(images[key], key)) {
				keys.push(key);
			}
		}
		setAnnotatedKeys(keys);
		const filteredImages: { [key: string]: string } = {};
		keys.forEach(k => { filteredImages[k] = images[k]; });
		setPreviewImages(filteredImages);
		setTimeout(async () => {
			if (previewRef.current) {
				const canvas = await html2canvas(previewRef.current, { scale: 2 });
				const imgData = canvas.toDataURL('image/png');
				setPdfPreviewUrl(imgData);
				setPdfReadyForUpload(true);
			}
			setPdfLoading(false);
		}, 300);
	};

	// Vérifier si la signature est présente (canvas non vide)
	const isSignaturePresent = () => {
		if (!signatureCanvasRef.current) return false;
		const ctx = signatureCanvasRef.current.getContext('2d');
		if (!ctx) return false;
		const pixels = ctx.getImageData(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height).data;
		return Array.from(pixels).some(channel => channel !== 0);
	};

	// Générer le PDF final avec signature et uploader
	const handleGenerateAndUploadPDF = async () => {
		if (!pdfPreviewUrl) return;
		if (!isSignaturePresent()) {
			setMessage('Veuillez signer avant de valider.');
			return;
		}
		setPdfLoading(true);
		setMessage(null);
		const img = new window.Image();
		img.src = pdfPreviewUrl;
		await new Promise(res => { img.onload = res; });
		const width = img.width;
		const height = img.height;
		const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [width, height + 80] });
		doc.addImage(pdfPreviewUrl, 'PNG', 0, 0, width, height);
		if (signatureCanvasRef.current) {
			const signatureData = signatureCanvasRef.current.toDataURL('image/png');
			doc.text('Signature du locataire' + (fullnameConducteur ? ` : ${fullnameConducteur}` : '') + ' :', 30, height + 30);
			doc.addImage(signatureData, 'PNG', 200, height + 10, 200, 32);
		}
		setPdfFileName('verification' + (fullnameConducteur ? `_${fullnameConducteur.replace(/\s+/g, '_')}` : '') + '.pdf');
		const pdfBlob = doc.output('blob');
		setPdfUrl(URL.createObjectURL(pdfBlob));
		try {
			let pdfUrlCloudinary = await uploadPdfToCloudinary(pdfBlob);
			// Remplacer .pdf par .png dans l'URL Cloudinary
			if (pdfUrlCloudinary.endsWith('.pdf')) {
				pdfUrlCloudinary = pdfUrlCloudinary.replace(/\.pdf$/, '.png');
			}
			if (typeof onPdfReady === 'function') {
				onPdfReady(pdfUrlCloudinary);
			}
			setMessage('PDF envoyé sur Cloudinary !');
		} catch (e) {
			setMessage("Erreur lors de l'envoi du PDF : " + (e as Error).message);
		}
		setPdfLoading(false);
	};

	// Aperçu HTML à capturer (tableau 2x2)
	const uncheckedText = getUncheckedText();
	const viewLabels = { front: 'Avant', rear: 'Arrière', left: 'Gauche', right: 'Droite' };

	// Correction de la gestion des coordonnées pour un canvas précis
	const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
		const canvas = signatureCanvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		let clientX = 0, clientY = 0;
		if ('touches' in e) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else {
			clientX = e.nativeEvent.clientX;
			clientY = e.nativeEvent.clientY;
		}
		// Adapter pour le ratio entre la taille CSS et la taille réelle du canvas
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		return {
			x: (clientX - rect.left) * scaleX,
			y: (clientY - rect.top) * scaleY
		};
	};
	const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
		setIsDrawing(true);
		const { x, y } = getCanvasPos(e);
		setLastPoint({ x, y });
	};
	const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
		if (!isDrawing || !signatureCanvasRef.current) return;
		const ctx = signatureCanvasRef.current.getContext('2d');
		if (!ctx) return;
		const { x, y } = getCanvasPos(e);
		if (lastPoint) {
			ctx.beginPath();
			ctx.moveTo(lastPoint.x, lastPoint.y);
			ctx.lineTo(x, y);
			ctx.strokeStyle = '#222';
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.stroke();
			setLastPoint({ x, y });
		}
	};
	const stopDrawing = () => {
		setIsDrawing(false);
		setLastPoint(null);
	};
	const clearSignature = () => {
		if (signatureCanvasRef.current) {
			const ctx = signatureCanvasRef.current.getContext('2d');
			ctx?.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
		}
	};

	// Utilitaire pour obtenir la liste des points décochés (à vérifier)
	const getUncheckedList = () => {
		const unchecked: string[] = [];
		Object.entries(checked).forEach(([item, isChecked]) => {
			if (!isChecked) unchecked.push(svgZoneLabels[item] || item);
		});
		return unchecked;
	};

	// Utilitaire pour obtenir les points décochés groupés par catégorie
	const getUncheckedByCategory = () => {
		const byCat: { [cat: string]: string[] } = {};
		Object.entries(checked).forEach(([item, isChecked]) => {
			if (!isChecked) {
				const cat = allItems[item] || 'Autre';
				if (!byCat[cat]) byCat[cat] = [];
				byCat[cat].push(svgZoneLabels[item] || item);
			}
		});
		return byCat;
	};

	return (
		<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
			{checklistData.map(section => (
				<div key={section.category}>
					<h3 className="font-bold text-lg mb-2 text-gray-800">{section.category}</h3>
					{/* Intégration du canvas interactif pour l'extérieur */}
					{section.category === 'Extérieur' && (
						<div className="mb-4 space-y-4">
							<BerlineCanvasInspector ref={canvasRef} />
						</div>
					)}
					<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{section.items.map(item => (
							<li key={item} className="flex items-center gap-2">
								<input
									type="checkbox"
									id={item}
									checked={!!checked[item]}
									onChange={() => handleCheck(item)}
									className="accent-[#3EFEFE] w-4 h-4"
								/>
								<label htmlFor={item} className="text-gray-700 cursor-pointer">
									{svgZoneLabels[item] || item}
								</label>
							</li>
						))}
					</ul>
				</div>
			))}
			{/* Aperçu HTML */}
			<div ref={previewRef} className="bg-white p-4 rounded shadow max-w-3xl mx-auto">
				<div className="grid grid-cols-2 gap-4 justify-center mb-4">
					{annotatedKeys.length === 0 ? (
						<div className="col-span-2 text-gray-500 italic">Aucune image annotée</div>
					) : (
						annotatedKeys.map((key) => (
							previewImages[key] ? (
								<div key={key} className="flex flex-col items-center">
									<span className="font-bold mb-1">{viewLabels[key]}</span>
									<img src={previewImages[key]} alt={key} style={{ width: 180, height: 100, objectFit: 'contain', border: '1px solid #ccc', borderRadius: 6 }} />
								</div>
							) : null
						))
					)}
				</div>
				<div className="mt-2 flex flex-col gap-2">
					<div>
						<div className="font-bold mb-1">Points à vérifier ou à corriger :</div>
						{Object.keys(getUncheckedByCategory()).length === 0 ? (
						<div className="text-gray-800 text-sm">Aucun défaut signalé</div>
						) : (
						<div className="space-y-2">
							<div className="grid grid-cols-2 gap-4 justify-center mb-4">
										{Object.entries(getUncheckedByCategory()).map(([cat, points]) => (
										<div key={cat}>
											<div className="font-semibold text-blue-900 mb-1">{cat}</div>
											<div className="grid grid-cols-2 gap-2">
											{points.map((point, idx) => (
												<div key={idx} className="text-gray-800 text-sm flex items-start">
												<span className="mr-2 text-blue-600">•</span> {point}
												</div>
											))}
											</div>
										</div>
										))}
							</div>

						</div>
						)}
					</div>
				</div>
			</div>
			{/* Aperçu et actions sur le PDF généré */}
			<div className="flex flex-col gap-4 items-end">
				{/* Étape 1 : Générer l'aperçu PDF */}
				{!pdfPreviewUrl && (
					<button onClick={handlePreviewPDF} className="mt-4 px-4 py-2 bg-blue-500 rounded font-bold text-white shadow" disabled={pdfLoading}>
						{pdfLoading ? 'Génération en cours...' : 'Générer l\'aperçu PDF'}
					</button>
				)}
				{/* Étape 2 : Signature obligatoire */}
				{pdfPreviewUrl && !pdfUrl && (
					<>
						<div className="w-full h-50 flex flex-col items-end">
							<div className="mb-2 text-gray-700">Merci de signer avant de valider :</div>
							<canvas
							ref={signatureCanvasRef}
							width={600}
							height={120}
							className="border-dashed border-2 border-gray-300 rounded w-full h-28 bg-white cursor-crosshair"
							onMouseDown={startDrawing}
							onMouseMove={draw}
							onMouseUp={stopDrawing}
							onMouseLeave={stopDrawing}
							onTouchStart={startDrawing}
							onTouchMove={draw}
							onTouchEnd={stopDrawing}
							/>
							<button type="button" onClick={clearSignature} className="mt-2 px-2 py-1 text-xs bg-gray-200 rounded">Effacer</button>
						</div>
						<button onClick={handleGenerateAndUploadPDF} className="mt-4 px-4 py-2 bg-green-600 rounded font-bold text-white shadow" disabled={pdfLoading}>
							{pdfLoading ? 'Envoi en cours...' : 'Valider et envoyer le rapport signé'}
						</button>
					</>
				)}
				{/* Étape 3 : PDF final généré et lien Cloudinary prêt */}
				{pdfUrl && (
					<>
						<iframe src={pdfUrl} title="Aperçu PDF" style={{ width: 600, height: 400, border: '1px solid #888', marginBottom: 8 }} />
						<a href={pdfUrl} download={pdfFileName} className="mb-2 text-blue-700 underline">
							Télécharger le PDF
						</a>
					</>
				)}
				{message && (
					<div className={`mt-2 text-sm ${message.startsWith('Erreur') ? 'text-red-600' : 'text-green-700'}`}>{message}</div>
				)}
			</div>
		</div>
	);
};

export default ChecklistEtatVoiture;
