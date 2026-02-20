import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    fileType?: string; // e.g., 'application/pdf', 'image/png'
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileUrl, fileName, fileType }) => {
    if (!isOpen) return null;

    // Helper to determine if we can preview
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileType?.includes('pdf') || fileUrl.includes('application/pdf');
    const isImage = fileName.match(/\.(jpeg|jpg|gif|png)$/i) || fileType?.includes('image') || fileUrl.includes('image/');

    // For API calls, append inline=true if not present
    const previewUrl = fileUrl.includes('/api/documents') && !fileUrl.includes('inline=true')
        ? `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}inline=true`
        : fileUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 truncate pr-4">{fileName}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            download={fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ดาวน์โหลด"
                        >
                            <Download size={20} />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ปิด"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 relative items-center justify-center flex overflow-hidden">
                    {isPdf ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    ) : isImage ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <div className="mb-4 text-gray-400">
                                <ExternalLink size={48} className="mx-auto" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">ไม่สามารถแสดงตัวอย่างไฟล์ได้</h4>
                            <p className="text-gray-500 mb-6">ไฟล์ประเภทนี้ไม่รองรับการแสดงผลในหน้าเว็บ</p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <Download size={18} className="mr-2" />
                                ดาวน์โหลดเพื่อเปิดดู
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
