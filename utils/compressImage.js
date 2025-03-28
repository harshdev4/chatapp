import sharp from 'sharp';

export const compressImage = async (buffer) => {
    const metadata = await sharp(buffer).metadata();
    
    // Define max allowed dimensions
    const MAX_WIDTH = 2000;
    const MAX_HEIGHT = 3000;

    let sharpInstance = sharp(buffer);

    // Resize only if the image is too large
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        const aspectRatio = metadata.width / metadata.height;

        let newWidth = metadata.width;
        let newHeight = metadata.height;

        // Scale down while maintaining aspect ratio
        if (metadata.width > MAX_WIDTH) {
            newWidth = MAX_WIDTH;
            newHeight = Math.round(MAX_WIDTH / aspectRatio);
        }
        if (newHeight > MAX_HEIGHT) {
            newHeight = MAX_HEIGHT;
            newWidth = Math.round(MAX_HEIGHT * aspectRatio);
        }

        sharpInstance = sharpInstance.resize({
            width: newWidth,
            height: newHeight,
            fit: "inside", // Ensures aspect ratio is maintained
        });
    }

    return await sharpInstance.jpeg({ quality: 60 }).toBuffer();
};