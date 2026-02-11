// Currency utility functions
export const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: Record<string, string> = {
        'NGN': '₦',
        'USD': '$',
        'GBP': '£',
        'EUR': '€',
        'GHS': '₵',
        'KES': 'KSh',
        'ZAR': 'R'
    };
    return symbols[currencyCode] || currencyCode;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
