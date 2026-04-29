import React from 'react';

export function useFormHandler<T>(setFormData: React.Dispatch<React.SetStateAction<T>>) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as T));
  };
}
