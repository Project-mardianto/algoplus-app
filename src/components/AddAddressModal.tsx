import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AddAddressModalProps {
  addressLine: string;
  suggestedName?: string;
  onClose: () => void;
  onSave: (name: string) => Promise<boolean>;
}

const AddAddressModal = ({ addressLine, suggestedName, onClose, onSave }: AddAddressModalProps) => {
  const [name, setName] = useState(suggestedName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (name && !isSaving) {
      setIsSaving(true);
      const success = await onSave(name);
      if (success) {
        onClose();
      } else {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-sm rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Simpan Alamat Baru</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Alamat</label>
            <p className="text-sm text-gray-600">{addressLine}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Nama Jalan</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jl. Sudirman No. 123"
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Batal</Button>
          <Button onClick={handleSave} disabled={!name || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;
