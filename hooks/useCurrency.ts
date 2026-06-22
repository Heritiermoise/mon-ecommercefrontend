import { useState, useEffect } from 'react';
import { getCurrentCurrency, setCurrency, formatPrice, CurrencyCode, CURRENCIES, updateCdfRate } from '@/lib/currency';
import { adminAPI } from '@/lib/api';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [tauxChange, setTauxChange] = useState<number>(2800);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrencyState(getCurrentCurrency());
    
    const loadTaux = async () => {
      try {
        const response: any = await adminAPI.tauxChange.getActif();
        if (response.success && response.data) {
          const taux = parseFloat(response.data.taux) || 2800;
          setTauxChange(taux);
          updateCdfRate(taux);
        }
      } catch (error) {
        console.log('Utilisation du taux par defaut (2800)');
        setTauxChange(2800);
        updateCdfRate(2800);
      } finally {
        setLoading(false);
      }
    };

    loadTaux();

    const handleCurrencyChange = (e: CustomEvent) => {
      setCurrencyState(e.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
  }, []);

  const changeCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setCurrencyState(newCurrency);
  };

  return {
    currency,
    tauxChange,
    changeCurrency,
    formatPrice: (price: number) => formatPrice(price, currency),
    symbol: CURRENCIES[currency].symbol,
    currencies: CURRENCIES,
    loading,
  };
}