
import {useState} from "react";
import { useApi } from "@/lib/api";
type TTSProps = {
    text: string | null;
}
export const useTTS = ({text}: TTSProps) => {
    const { generateSpeech } = useApi();
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    
    const generateAudio = async () => {
        if(!text) return;
        try {
            setIsLoading(true);
            const audioUrl = await generateSpeech(text);
            setAudioUrl(audioUrl);
        } catch (error:unknown) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return {
        audioUrl, // Temporary invalid URL
        isLoading,
        error,
        generateAudio,
    }
}