import React from 'react';

// CRITICAL: Must be 'export default function PetDisplay'
export default function PetDisplay() {
  // Use a bright, temporary background class (bg-red-500) 
  return (
    <div className="w-48 h-60 p-3 bg-red-500 border border-white rounded-lg shadow-xl flex flex-col items-center">
      <h1 className="text-white text-lg font-bold">PET WIDGET IS HERE!</h1>
    </div>
  );
}