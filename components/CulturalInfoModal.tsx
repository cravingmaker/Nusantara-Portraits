/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CulturalInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    isLoading: boolean;
    error: string | null;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full py-10">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const CulturalInfoModal: React.FC<CulturalInfoModalProps> = ({ isOpen, onClose, title, content, isLoading, error }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-neutral-900 border border-white/10 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                            <h2 id="modal-title" className="font-caveat text-4xl text-white-300">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                                aria-label="Close dialog"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <div className="p-6 overflow-y-auto">
                            {isLoading && <LoadingSpinner />}
                            {error && <p className="text-red-400 text-center">{error}</p>}
                            {!isLoading && !error && (
                                <p className="text-lg text-neutral-200 whitespace-pre-wrap leading-relaxed">
                                    {content}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CulturalInfoModal;
