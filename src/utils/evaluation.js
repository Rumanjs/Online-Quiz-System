export const evaluateQuiz = (quiz, userAnswers) => {
  let score = 0;
  const totalQuestions = quiz.questions.length;
  const results = [];

  quiz.questions.forEach((q) => {
    const userAnswer = userAnswers[q.id];
    let isCorrect = false;

    if (q.type === 'mcq') {
      isCorrect = parseInt(userAnswer) === q.correctOptionIndex;
    } else if (q.type === 'short_answer') {
      if (userAnswer && q.keywords) {
        const keywords = q.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
        const uAns = String(userAnswer).toLowerCase();
        
        const matchCount = keywords.reduce((count, kw) => count + (uAns.includes(kw) ? 1 : 0), 0);
        
        if (matchCount > 0 || uAns === q.keywords.toLowerCase().trim()) {
          isCorrect = true;
        }
      }
    }

    if (isCorrect) score += 1;
    results.push({
      questionId: q.id,
      isCorrect,
      userAnswer: userAnswer || "No answer provided",
      correctAnswer: q.type === 'mcq' ? q.options[q.correctOptionIndex] : q.keywords,
      questionText: q.text
    });
  });

  return {
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    results
  };
};
