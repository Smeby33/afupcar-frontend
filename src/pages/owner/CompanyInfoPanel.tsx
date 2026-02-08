import React from 'react';

interface CompanyInfoFormProps {
  form: any;
  edit: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetPosition?: () => void;
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({
  form,
  edit,
  handleChange,
  handleLogoUpload,
  handleGetPosition,
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Informations sur l'entreprise</h2>
    <div>
      <label className="block text-gray-600">Nom de l'entreprise*</label>
      <input
        type="text"
        name="companyname"
        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
        value={form.companyname}
        onChange={handleChange}
        readOnly={!edit}
        required
        placeholder={edit ? "Nom de votre entreprise" : "Non renseigné"}
      />
    </div>
    <div>
      <label className="block text-gray-600">Numéro NIF/RCCM*</label>
      <input
        type="text"
        name="numeronif"
        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
        value={form.numeronif}
        onChange={handleChange}
        readOnly={!edit}
        required
        placeholder={edit ? "Numéro d'identification fiscal" : "Non renseigné"}
      />
    </div>
    <div>
      <label className="block text-gray-600">Adresse complète*</label>
      <input
        type="text"
        name="adresse"
        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
        value={form.adresse}
        onChange={handleChange}
        readOnly={!edit}
        required
        placeholder={edit ? "Adresse de l'entreprise" : "Non renseigné"}
      />
    </div>
    {edit && (
      <button
        type="button"
        className="mt-2 bg-[#3EFEFE] text-black px-4 py-2 rounded-lg font-bold"
        onClick={handleGetPosition}
      >
        Obtenir ma position
      </button>
    )}
    <div>
      <label className="block text-gray-600">Logo de votre entreprise</label>
      {edit && (
        <>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="logo-upload"
            onChange={handleLogoUpload}
          />
          <label
            htmlFor="logo-upload"
            style={{ cursor: 'pointer', display: 'inline-block' }}
          >
            <video
              src="https://cdn-icons-mp4.flaticon.com/512/8797/8797862.mp4"
              autoPlay
              loop
              muted
              style={{ width: 80, height: 80, background: 'transparent' }}
            />
            <p className="text-sm text-gray-500 mt-1 text-center">
              Cliquez sur l'icône pour uploader une image
            </p>
          </label>
        </>
      )}
      {form.picture && (
        <div className="mt-2">
          <img
            src={form.picture}
            alt="Logo entreprise"
            className="mx-auto max-h-32 rounded shadow"
          />
        </div>
      )}
    </div>
  </div>
);

export default CompanyInfoForm;