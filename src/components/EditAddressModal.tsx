import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface Address {
  id: number;
  name: string;
  address: string;
  user_id?: string;
}

interface EditAddressModalProps {
  address: Address;
  onClose: () => void;
  onSave: (updatedAddress: { name: string; address: string; }) => void;
}

const EditAddressModal = ({ address, onClose, onSave }: EditAddressModalProps) => {
  const [name, setName] = useState(address.name);
  const [addressLine, setAddressLine] = useState(address.address);

  const handleSave = () => {
    onSave({ name, address: addressLine });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-sm rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Ubah Alamat</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Jalan</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Alamat</label>
            <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </div>
    </div>
  );
};

export default EditAddressModal;
