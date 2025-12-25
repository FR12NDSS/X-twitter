/**
 * Generates a thumbnail image from a video file.
 * Captures a frame at the 1-second mark (or earlier if video is shorter).
 */
export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    
    // Create a URL for the video file
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous"; // Handle CORS if necessary for some setups

    // Wait for metadata to load to know duration
    video.onloadedmetadata = () => {
      // Seek to 1 second or 0.1s if video is very short
      video.currentTime = Math.min(video.duration, 1.0);
    };

    // When the video has sought to the time, capture the frame
    video.onseeked = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL (JPEG format)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      } else {
        reject(new Error("Could not get canvas context"));
      }
      // Cleanup
      URL.revokeObjectURL(video.src);
    };

    video.onerror = (e) => {
      reject(e);
    };
  });
};

/**
 * Helper to convert Base64 Data URL to a File object
 * useful for uploading the generated thumbnail via existing upload services
 */
export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
};