import { toast } from 'sonner';

export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'armada_auto');
  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dubsfeixa/auto/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      toast.success('Document uploadé avec succès !');
      return data.secure_url;
    } else {
      toast.error("Erreur lors de l'upload du document.");
      return null;
    }
  } catch (err) {
    toast.error("Erreur lors de l'upload du document.");
    return null;
  }
};
