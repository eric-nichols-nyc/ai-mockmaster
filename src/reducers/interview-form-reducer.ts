
import { FormState, FormAction } from "@/types";

export const initialState: FormState = {
    jobTitle: '',
    jobDescription: '',
    selectedSkills: [],
    availableSkills: [],
    isSubmitted: false,
    isLoading: false,
    errors: {},
  };

  

  // create a reducer that will handle the form state and actions
  export const interviewFormReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'SET_JOB':
            return { 
                ...state, 
                jobTitle: action.payload.title, 
                jobDescription: action.payload.description 
            };
        case 'SET_SKILLS':
            return { 
                ...state, 
                selectedSkills: action.payload 
            };
        case 'SET_AVAILABLE_SKILLS':
            return { 
                ...state, 
                availableSkills: action.payload 
            };
            case 'SET_ERRORS':
                return {
                  ...state,
                  errors: action.payload,
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                errors: {},
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'SET_SUBMITTED':
            return {
                ...state,
                isSubmitted: action.payload,
            };
        case 'RESET_FORM':
            return initialState;
        default:
            return state;
    }
  }