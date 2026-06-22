// Configuration des devises
export const CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dollar américain',
    rate: 1,
    locale: 'en-US',
  },
  CDF: {
    code: 'CDF',
    symbol: 'FC',
    name: 'Franc congolais',
    rate: 2800, // Taux par défaut, sera mis à jour depuis les paramètres
    locale: 'fr-CD',
  },
};

export type CurrencyCode = keyof typeof CURRENCIES;

// Récupérer la devise actuelle depuis localStorage
export function getCurrentCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  return (localStorage.getItem('currency') as CurrencyCode) || 'USD';
}

// Changer la devise
export function setCurrency(currency: CurrencyCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currency', currency);
    // Déclencher un événement pour mettre à jour tous les composants
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
  }
}

// Mettre à jour le taux de change CDF depuis les paramètres
export function updateCdfRate(rate: number): void {
  CURRENCIES.CDF.rate = rate;
  // Déclencher un événement pour rafraîchir tous les prix
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('currencyRateChanged', { detail: rate }));
  }
}

// Formater un prix dans la devise actuelle
export function formatPrice(priceInUSD: number, currencyCode?: CurrencyCode): string {
  const currency = CURRENCIES[currencyCode || getCurrentCurrency()];
  const price = priceInUSD * currency.rate;
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.code === 'CDF' ? 0 : 2,
    maximumFractionDigits: currency.code === 'CDF' ? 0 : 2,
  }).format(price);
}

// Convertir un prix d'une devise à une autre
export function convertPrice(price: number, from: CurrencyCode, to: CurrencyCode): number {
  const priceInUSD = price / CURRENCIES[from].rate;
  return priceInUSD * CURRENCIES[to].rate;
}

// Obtenir le symbole de la devise
export function getCurrencySymbol(currencyCode?: CurrencyCode): string {
  return CURRENCIES[currencyCode || getCurrentCurrency()].symbol;
}