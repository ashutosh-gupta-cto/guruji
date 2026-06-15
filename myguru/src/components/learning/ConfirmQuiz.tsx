import { useState } from 'react';

import type { QuizQuestion } from '../../content/types';
import { markModuleComplete } from '../../lib/progress';

interface ConfirmQuizProps {
  moduleId: string;
  quiz: QuizQuestion[];
  onBack: () => void;
}

export default function ConfirmQuiz({ moduleId, quiz, onBack }: ConfirmQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    () => quiz.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const allAnswered = selectedAnswers.every((answer) => answer !== null);

  const isQuestionCorrect = (questionIndex: number): boolean => {
    const answer = selectedAnswers[questionIndex];
    return answer === quiz[questionIndex].correctIndex;
  };

  const allCorrect = quiz.every((_, index) => isQuestionCorrect(index));

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (confirmed) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    if (quiz.every((_, index) => isQuestionCorrect(index))) {
      markModuleComplete(moduleId);
      setConfirmed(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers(quiz.map(() => null));
    setSubmitted(false);
  };

  return (
    <div className="confirm-panel">
      <h2>Check your understanding</h2>
      <p>Answer each question below to confirm you grasp the core ideas from this lesson.</p>

      {quiz.map((question, questionIndex) => {
        const showFeedback = submitted && selectedAnswers[questionIndex] !== null;
        const correct = isQuestionCorrect(questionIndex);

        return (
          <div key={question.question} className="confirm-quiz__question">
            <p className="confirm-quiz__prompt">
              <span className="confirm-quiz__number">{questionIndex + 1}.</span>
              {question.question}
            </p>
            <div className="confirm-panel__options">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[questionIndex] === optionIndex;
                const isCorrectOption = optionIndex === question.correctIndex;
                let optionClass = 'confirm-option';
                if (isSelected) optionClass += ' confirm-option--selected';
                if (showFeedback && isSelected && !correct) {
                  optionClass += ' confirm-option--incorrect';
                }
                if (showFeedback && isCorrectOption) {
                  optionClass += ' confirm-option--correct';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    className={optionClass}
                    onClick={() => handleSelect(questionIndex, optionIndex)}
                    disabled={confirmed}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {showFeedback && !correct && (
              <p className="confirm-quiz__explanation">{question.explanation}</p>
            )}
          </div>
        );
      })}

      {confirmed ? (
        <p className="confirm-quiz__success">Lesson marked complete! Progress saved.</p>
      ) : (
        <div className="confirm-quiz__actions">
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            Back to Try
          </button>
          {submitted && !allCorrect ? (
            <button type="button" className="btn btn--primary" onClick={handleRetry}>
              Try again
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={!allAnswered}
            >
              Submit answers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
