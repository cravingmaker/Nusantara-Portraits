/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { cn } from '../lib/utils';

type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

interface ActivityImages {
    images: GeneratedImage[];
    currentIndex: number;
}

interface ProvinceSelectorProps {
    provinces: string[];
    selectedProvince: string;
    onSelectProvince: (province: string) => void;
    generatedImages: Record<string, Record<string, ActivityImages>>;
    allProvincesData: Record<string, { activity: string, location: string }[]>;
    isPlaying: boolean;
    onTogglePlay: () => void;
}

const SmallLoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4.018 15.59a.5.5 0 00.77.41l11-6.5a.5.5 0 000-.82l-11-6.5A.5.5 0 004 3.5v12a.5.5 0 00.018.09z" />
    </svg>
);
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
    </svg>
);


const CultureSelector: React.FC<ProvinceSelectorProps> = ({
    provinces,
    selectedProvince,
    onSelectProvince,
    generatedImages,
    allProvincesData,
    isPlaying,
    onTogglePlay,
}) => {
    return (
        <div 
          className="flex space-x-4 overflow-x-auto p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
            {provinces.map(province => {
                const firstActivity = allProvincesData[province]?.[0]?.activity;
                const activityData = generatedImages[province]?.[firstActivity];
                const previewImage = activityData?.images[activityData.currentIndex ?? 0];
                const isGenerating = previewImage?.status === 'pending';
                const isSelected = province === selectedProvince;

                return (
                    <button
                        key={province}
                        onClick={() => onSelectProvince(province)}
                        className={cn(
                            "flex-shrink-0 w-32 h-44 bg-neutral-100 rounded-md p-2 flex flex-col items-center justify-start relative transition-all duration-300 transform hover:scale-105 hover:-translate-y-2",
                            isSelected ? 'border-4 border-yellow-400 shadow-lg' : 'border-2 border-transparent'
                        )}
                        aria-pressed={isSelected}
                    >
                        <div className="w-full h-28 bg-neutral-900 mb-2 relative">
                            {previewImage?.url && (
                                <img src={previewImage.url} alt={`Preview for ${province}`} className="w-full h-full object-cover" />
                            )}
                            {isGenerating && <SmallLoadingSpinner />}

                            {isSelected && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity opacity-100">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onTogglePlay(); 
                                        }} 
                                        className={cn(
                                            "w-12 h-12 bg-yellow-400/90 rounded-full flex items-center justify-center text-black hover:bg-yellow-400 transform transition-transform hover:scale-110",
                                            !isPlaying && "pl-1" // Optically center the play icon
                                        )}
                                        aria-label={isPlaying ? 'Pause voiceover' : 'Play voiceover'}
                                    >
                                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="font-permanent-marker text-sm text-black text-center truncate w-full">
                            {province}
                        </p>
                    </button>
                );
            })}
        </div>
    );
};

export default CultureSelector;