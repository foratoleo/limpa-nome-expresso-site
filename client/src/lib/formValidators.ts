export const validators = {
  cpf: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11;
  },

  currency: (value: string): boolean => {
    return /^\d{1,3}(\.\d{3})*,\d{2}$/.test(value);
  },

  date: (value: string): boolean => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  },

  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  phone: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
};

export const formaters = {
  cpf: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  currency: (value: string): string => {
    const num = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  },

  date: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }
    return value;
  },
};
