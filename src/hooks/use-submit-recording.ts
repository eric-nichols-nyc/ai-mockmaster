import { useCallback, useState } from "react";
import { useApi } from "@/lib/api";

// type SaveStatus = "saving" | "saved" | "error";

type SubmitRecordingProps = {
    interviewId: string;
    questionId: string;
    audioBlob: Blob;
    answer?: string;
    audioUrl?: string;
}

const createAudioFile = (blob: Blob) => {
    return new File([blob], "audio.mp3", {
        type: blob.type,
    });
};


type SaveAnswerProps = {
    interviewId: string;
    questionId: string;
    answer: string;
    audioUrl: string;
}


export const useSubmitRecording = () => {
    const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saving");
    const [error, setError] = useState<string | null>(null);
    const { fetchApi, transcribeAudio } = useApi();

    const transcribedAudio = async (formData: FormData) => {
        const { answer, audioUrl } = await transcribeAudio(formData);
        return { answer, audioUrl };
    }

    const saveAnswer = async ({ interviewId, questionId, answer, audioUrl }: SaveAnswerProps) => {
        const updatedQuestion = await fetchApi(
            `/interviews/${interviewId}/questions/${questionId}/answer`,
            {
                method: "PUT",
                body: JSON.stringify({ answer, audioUrl }),
            }
        );

        if (!updatedQuestion?.audioUrl) {
            throw new Error("Invalid response from server");
        }

        return updatedQuestion;
    };


    const handleSubmitRecording = useCallback(async ({ interviewId, questionId, audioBlob }: SubmitRecordingProps) => {
        setSaveStatus("saving");
        // validate props
        if (!interviewId || !questionId || !audioBlob) {
            setSaveStatus("error");
            setError("Invalid props");
            return;
        }
        //create audio file
        const audioFile = createAudioFile(audioBlob);


        const formData = new FormData();
        formData.append("audio", audioFile, "audio.mp3");

        // Get transcription
        const { answer, audioUrl } = await transcribedAudio(formData);

        // Save answer
        await saveAnswer({ interviewId, questionId, answer, audioUrl });

    }, [])



    return {
        saveStatus,
        handleSubmitRecording,
        error
    }

}
