export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const digitGroups = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = (bytes / Math.pow(1024, digitGroups)).toFixed(2);

    // Remove trailing .00 when not needed
    const cleanSize = formattedSize.endsWith('.00')
        ? formattedSize.slice(0, -3)
        : formattedSize.replace(/\.?0+$/, '');

    return `${cleanSize} ${units[digitGroups]}`;
};