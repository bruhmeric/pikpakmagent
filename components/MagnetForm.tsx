import React, { useState } from 'react';
import { PlusIcon, SpinnerIcon } from './icons';

interface MagnetFormProps {
  onSubmit: (magnetLink: string) => void;
  isLoading: boolean;
}

const MagnetForm: React.FC<MagnetFormProps> = ({ onSubmit, isLoading }) => {
  const [magnetLink, setMagnetLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (magnetLink.trim() && !isLoading) {
      onSubmit(magnetLink.trim());
      setMagnetLink('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={magnetLink}
        onChange={(e) => setMagnetLink(e.target.value)}
        placeholder="magnet:?xt=urn:btih:..."
        className="flex-grow bg-black border border-gray-700 text-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !magnetLink.trim()}
        className="flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="animate-spin h-5 w-5" />
            Adding...
          </>
        ) : (
          <>
            <PlusIcon className="h-5 w-5" />
            Add Task
          </>
        )}
      </button>
    </form>
  );
};

export default MagnetForm;