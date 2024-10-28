import { useApi } from '@/lib/api';

export const useOpenAI = () => {
  const { fetchApi } = useApi();

  const generateSpeech = async (text: string): Promise<string> => {
    try {
      const response = await fetchApi('/openai/text-to-speech', {
        method: 'POST',
        body: { text },
      });
      return response.audioUrl;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  };

  const transcribeAudio = async (formData: FormData) => {
    const response = await fetchApi("/openai/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response?.transcription) {
      throw new Error("Invalid response from transcription service");
    }

    return {
      answer: response.transcription,
      audioUrl: response.audioUrl,
    };
  };

  return { generateSpeech, transcribeAudio };
};
