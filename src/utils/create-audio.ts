type Result<T, E = Error> = {
    success: boolean;  // Required field
    data?: T;         // Optional field of type T
    error?: E;        // Optional field of type E
};

export const createAudioFile = (blob: Blob): Result<File> => {
    if (!blob) {
      return {
        success: false,
        error: new Error('Blob is required')
      };
    }
  
    if (!blob.type.includes('audio')) {
      return {
        success: false,
        error: new Error('Invalid file type. Expected audio file')
      };
    }
  
    try {
      const file = new File([blob], "audio.mp3", {
        type: blob.type,
      });
      return {
        success: true,
        data: file
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };