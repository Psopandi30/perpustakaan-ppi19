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

export const getYoutubeEmbedUrl = (url: string, autoplay: boolean = true, mute: boolean = false): string | null => {
    if (!url) return null;
    let videoId = '';

    // Matches various YouTube URL formats
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (match && match[1]) {
        videoId = match[1];
    } else {
        // Fallback: try to see if it's already an embed URL and extract ID
        if (url.includes('embed/')) {
            const parts = url.split('embed/');
            if (parts[1]) {
                const idPart = parts[1].split('?')[0];
                if (idPart) videoId = idPart;
            }
        }

        if (!videoId) return null;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const muteParam = mute ? '1' : '0';
    const autoplayParam = autoplay ? '1' : '0';

    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&mute=${muteParam}&origin=${encodeURIComponent(origin)}`;
};


