import React from 'react';

interface PersonalInfoFormProps {
  form: any;
  edit: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  form,
  edit,
  handleChange,
  handleFileUpload,
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Informations personnelles</h2>
    <div>
      <label className="block text-gray-600">Nom complet*</label>
      <input
        type="text"
        name="fullname"
        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
        value={form.fullname}
        onChange={handleChange}
        readOnly={!edit}
        required
      />
    </div>
    <div>
      <label className="block text-gray-600">Email*</label>
      <input
        type="email"
        name="email"
        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
        value={form.email}
        onChange={handleChange}
        readOnly={!edit}
        required
      />
    </div>
    <div>
      <label className="block text-gray-600">Téléphone*</label>
      <input
        type="tel"
        name="phone"
        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
        value={form.phone}
        onChange={handleChange}
        readOnly={!edit}
        required
      />
    </div>
    <div>
      <label className="block text-gray-600">Numéro CNI</label>
      {edit && (
        <>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            id="cni-upload"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="cni-upload"
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
              Cliquez sur l'icône pour uploader votre pièce d'identité
            </p>
          </label>
        </>
      )}
      {form.documentcni && (
        <div className="mt-2">
          {form.documentcni.match(/\.(jpeg|jpg|png|gif)$/i) ? (
            <img
              src={form.documentcni}
              alt="Aperçu pièce d'identité"
              className="mx-auto max-h-40 rounded shadow"
            />
          ) : (
            <a
              href={form.documentcni}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 underline"
            >
              Voir la pièce d'identité
            </a>
          )}
        </div>
      )}
    </div>
  </div>
);

export default PersonalInfoForm;