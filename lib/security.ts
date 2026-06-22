/**
 * Service de sécurité frontend
 */

export class SecurityService {
  /**
   * Nettoyer les entrées utilisateur (prévention XSS)
   */
  static sanitize(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valider un email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valider un mot de passe fort
   */
  static validatePassword(password: string): { valid: boolean; errors: string[]; strength: number } {
    const errors: string[] = [];
    let strength = 0;

    if (password.length >= 8) strength++;
    else errors.push('Minimum 8 caracteres');

    if (/[A-Z]/.test(password)) strength++;
    else errors.push('Au moins une majuscule');

    if (/[a-z]/.test(password)) strength++;
    else errors.push('Au moins une minuscule');

    if (/[0-9]/.test(password)) strength++;
    else errors.push('Au moins un chiffre');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else errors.push('Au moins un caractere special');

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  }

  /**
   * Valider un numéro de téléphone
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Générer un token CSRF
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Vérifier l'intégrité des données
   */
  static verifyDataIntegrity(data: any, expectedHash: string): boolean {
    // Implémentation simplifiée - en production utiliser crypto.subtle
    const dataString = JSON.stringify(data);
    const hash = btoa(dataString);
    return hash === expectedHash;
  }

  /**
   * Détecter les comportements suspects
   */
  static detectSuspiciousBehavior(): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Vérifier si DevTools est ouvert
    const devtoolsOpen = /./ as any;
    devtoolsOpen.toString = function() {
      reasons.push('DevTools detecte');
      return 'devtools';
    };

    // Vérifier automation (Selenium, Puppeteer)
    if ((navigator as any).webdriver) {
      reasons.push('Automation detectee (webdriver)');
    }

    // Vérifier plugins suspects
    if (navigator.plugins && navigator.plugins.length === 0) {
      reasons.push('Aucun plugin detecte (possible bot)');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Logger les événements de sécurité
   */
  static async logSecurityEvent(eventType: string, details: any): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/security-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          event_type: eventType,
          details,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Erreur log security:', error);
    }
  }
}