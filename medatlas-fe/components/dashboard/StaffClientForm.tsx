'use client';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  role: string;
}

export const StaffClientForm = ({ onSave }: { onSave: (data: FormData) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !role) {
      alert('All fields are required!');
      return;
    }
    onSave({ name, email, role });
    setName('');
    setEmail('');
    setRole('');
  };

  return (
    <div className="p-4 bg-card rounded-xl shadow flex flex-col gap-2">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded-lg"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded-lg"
      />
      <input
        type="text"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded-lg"
      />
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:opacity-80 transition-all"
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  );
};
