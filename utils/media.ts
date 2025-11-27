export const resolveImageUrl = (url?: string): string => {
    if (!url) return '';

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';

    const driveFileMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    const driveOpenMatch = trimmedUrl.match(/drive\.google\.com\/open\?id=([^&]+)/);
    const driveUcMatch = trimmedUrl.match(/drive\.google\.com\/uc\?id=([^&]+)/);

    const fileId = driveFileMatch?.[1] || driveOpenMatch?.[1] || driveUcMatch?.[1];

    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return trimmedUrl;
};


