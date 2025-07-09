export const extractTimestamps = (text: string): string[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const timestamps: string[] = [];
  
  // Regex to find HH:MM pattern (00-23:00-59)
  const timeRegex = /([01]?[0-9]|2[0-3]):([0-5][0-9])/;
  
  lines.forEach(line => {
    const match = line.match(timeRegex);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      timestamps.push(`${hours}:${minutes}`);
    }
  });
  
  return timestamps;
};

export const subtractSecondsFromTimestamp = (timestamp: string, secondsToSubtract: number): string => {
  const [hours, minutes] = timestamp.split(':').map(Number);
  
  // Convert to total seconds
  let totalSeconds = hours * 3600 + minutes * 60;
  
  // Subtract the specified seconds
  totalSeconds -= secondsToSubtract;
  
  // Handle negative values (wrap to previous day)
  if (totalSeconds < 0) {
    totalSeconds += 24 * 3600; // Add 24 hours worth of seconds
  }
  
  // Convert back to HH:MM:SS
  const newHours = Math.floor(totalSeconds / 3600) % 24;
  const newMinutes = Math.floor((totalSeconds % 3600) / 60);
  const newSeconds = totalSeconds % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
};

export const processTimestamps = (text: string, antidelaySeconds: number): string[] => {
  const timestamps = extractTimestamps(text);
  return timestamps.map(timestamp => subtractSecondsFromTimestamp(timestamp, antidelaySeconds));
};