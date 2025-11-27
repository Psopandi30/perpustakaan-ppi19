const isISODate = (value: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

export const toDateInputValue = (value?: string): string => {
    if (!value) return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (isISODate(trimmed)) return trimmed;

    const slashParts = trimmed.split('/');
    if (slashParts.length === 3) {
        const [day, month, year] = slashParts;
        if (year.length === 4) {
            const normalizedDay = day.padStart(2, '0');
            const normalizedMonth = month.padStart(2, '0');
            return `${year}-${normalizedMonth}-${normalizedDay}`;
        }
    }

    const dashParts = trimmed.split('-');
    if (dashParts.length === 3 && dashParts[2].length === 4) {
        // handle formats like DD-MM-YYYY
        const [day, month, year] = dashParts;
        const normalizedDay = day.padStart(2, '0');
        const normalizedMonth = month.padStart(2, '0');
        return `${year}-${normalizedMonth}-${normalizedDay}`;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }

    return '';
};


