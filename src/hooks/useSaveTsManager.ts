import { useState, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { processTimestamps } from '@/utils/timestampUtils';

export const useSaveTsManager = () => {
  const [showSaveTsDialog, setShowSaveTsDialog] = useState(false);
  const [locationInput, setLocationInput] = useState('/sdcard/Documents/');
  const [antidelayInput, setAntidelayInput] = useState('15');
  const [saveTsButtonPressed, setSaveTsButtonPressed] = useState(false);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // Save Ts button handlers
  const handleSaveTsMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('💾 SaveTsManager: Save Ts button mouse down');
    e.preventDefault();
    e.stopPropagation();
    setSaveTsButtonPressed(true);
    isLongPressRef.current = false;
    
    longPressTimerRef.current = setTimeout(() => {
      console.log('💾 SaveTsManager: Long press detected - showing save dialog');
      isLongPressRef.current = true;
      setShowSaveTsDialog(true);
    }, 3000);
  };

  const handleSaveTsMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('💾 SaveTsManager: Save Ts button mouse up', {
      isLongPress: isLongPressRef.current
    });
    
    e.preventDefault();
    e.stopPropagation();
    setSaveTsButtonPressed(false);
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // If it wasn't a long press, do nothing (or could show a toast)
    if (!isLongPressRef.current) {
      console.log('💾 SaveTsManager: Short press detected - no action');
    }
  };

  const handleSaveTsMouseLeave = () => {
    console.log('💾 SaveTsManager: Save Ts button mouse leave');
    setSaveTsButtonPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // File browser handler
  const handleBrowseFile = () => {
    console.log('💾 SaveTsManager: Browse file button clicked');
    
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // For web, we use the File API path (which is just the name)
        // For mobile, we would need the full path, but this gives us the file name
        setLocationInput(file.name);
        console.log('💾 SaveTsManager: File selected:', file.name);
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  // Save Ts dialog handlers
  const handleSaveTsSubmit = async (signalsText: string) => {
    console.log('💾 SaveTsManager: Save Ts dialog submit with values:', {
      location: locationInput,
      antidelay: antidelayInput
    });
    
    try {
      // Extract timestamps and process them
      const antidelaySeconds = parseInt(antidelayInput) || 0;
      const processedTimestamps = processTimestamps(signalsText, antidelaySeconds);
      
      console.log('💾 SaveTsManager: Processed timestamps:', processedTimestamps);
      
      // Create file content
      const fileContent = processedTimestamps.join('\n');
      
      // Create and download the file
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'timestamps.txt';
      downloadLink.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('💾 SaveTsManager: File downloaded successfully');
      setShowSaveTsDialog(false);
      
    } catch (error) {
      console.error('💾 SaveTsManager: Error downloading file:', error);
      // Keep dialog open on error so user can retry
    }
  };

  const handleSaveTsCancel = () => {
    console.log('💾 SaveTsManager: Save Ts dialog cancelled');
    setShowSaveTsDialog(false);
  };

  return {
    showSaveTsDialog,
    locationInput,
    setLocationInput,
    antidelayInput,
    setAntidelayInput,
    saveTsButtonPressed,
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleBrowseFile,
    handleSaveTsSubmit,
    handleSaveTsCancel
  };
};