import { create } from 'zustand';

export const useQuizStore = create((set) => ({
  currentQuiz: null,
  answers: {}, // { questionId: answer }
  timeRemaining: 0,
  isSubmitting: false,
  
  startQuiz: (quiz) => {
    set({ 
      currentQuiz: quiz, 
      answers: {}, 
      timeRemaining: quiz.timeLimit ? quiz.timeLimit * 60 : 0 // assumed minutes to seconds
    });
  },

  setAnswer: (questionId, answer) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer }
    }));
  },

  decrementTime: () => {
    set((state) => {
      if (state.timeRemaining <= 0) return state;
      return { timeRemaining: state.timeRemaining - 1 };
    });
  },

  submitQuiz: async () => {
    set({ isSubmitting: true });
    // Core submission and evaluation logic
    set({ isSubmitting: false });
  },

  clearQuiz: () => {
    set({ currentQuiz: null, answers: {}, timeRemaining: 0, isSubmitting: false });
  }
}));
