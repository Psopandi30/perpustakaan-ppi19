import React from 'react';

interface PDFViewerProps {
    url: string;
    onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose }) => {
    // Helper to convert Google Drive 'view' to 'preview' for embedding
    const getEmbedUrl = (link: string) => {
        if (!link) return '';
        // Handle typical Google Drive links
        if (link.includes('drive.google.com')) {
            // If it has /view, replace with /preview
            if (link.includes('/view')) {
                return link.replace(/\/view.*/, '/preview');
            }
            // If it doesn't have preview, try appending (unless it's already download link)
            if (!link.includes('/preview')) {
                // Simple heuristic
                if (link.endsWith('/')) return link + 'preview';
                return link + '/preview';
            }
        }
        return link;
    };

    const embedUrl = getEmbedUrl(url);

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col h-full w-full animate-fade-in">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-900 text-white border-b border-gray-800 shadow-md z-10 shrink-0">
                <h3 className="font-medium text-sm sm:text-base truncate flex-1 pr-4 text-gray-300">
                    Membaca Dokumen
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    aria-label="Tutup"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 w-full h-full relative bg-gray-800 overflow-hidden">
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full border-0 absolute inset-0"
                        allow="autoplay; fullscreen"
                        title="PDF Reader"
                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Link dokumen tidak valid.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFViewer;
