import { useState, useCallback } from 'react';
import { SecurityService } from '@/lib/security';

export function useSecureInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const sanitized = SecurityService.sanitize(e.target.value);
    setValue(sanitized);
  }, []);

  const setValueSecure = useCallback((newValue: string) => {
    setValue(SecurityService.sanitize(newValue));
  }, []);

  return {
    value,
    onChange: handleChange,
    setValue: setValueSecure,
  };
}