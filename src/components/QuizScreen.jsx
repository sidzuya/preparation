import React, { useState, useEffect } from 'react';
import { ALL_QUIZ_IDS } from '../App';

const QuizScreen = ({ quizId, quizTitle, onBack }) => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to shuffle array
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setAnswerHistory([]);
    setIsFinished(false);
    setLoading(true);

    if (quizId === 'mixed') {
      // Fetch all quizzes
      Promise.all(ALL_QUIZ_IDS.map(id => fetch(`/quizzes/${id}.json`).then(res => res.json())))
        .then(results => {
          let allQuestions = [];
          results.forEach(quiz => {
            if (quiz.questions) {
              // Add a tag to know which presentation it came from
              const qWithSource = quiz.questions.map(q => ({
                ...q,
                sourceTitle: quiz.title
              }));
              allQuestions = [...allQuestions, ...qWithSource];
            }
          });
          
          // Shuffle all questions and pick 50 (or less if not enough)
          allQuestions = shuffleArray(allQuestions).slice(0, 50);
          
          setQuizData({
            title: 'Смешанный тест (50 случайных вопросов)',
            questions: allQuestions
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading mixed quiz", err);
          setLoading(false);
        });
    } else {
      // Fetch single quiz
      fetch(`/quizzes/${quizId}.json`)
        .then(res => res.json())
        .then(data => {
          setQuizData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading quiz", err);
          setLoading(false);
        });
    }
  }, [quizId]);

  if (loading) {
    return <div className="quiz-screen"><p>Загрузка теста...</p></div>;
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="quiz-screen">
        <button className="back-btn" onClick={onBack}>← Назад</button>
        <div className="question-container">
          <p>Ошибка загрузки вопросов. Пожалуйста, попробуйте позже.</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = quizData.questions.length;
    const score = answerHistory.filter((a) => a.isCorrect).length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const gradeMessage =
      percentage >= 90 ? 'Отлично!' :
      percentage >= 70 ? 'Хороший результат!' :
      percentage >= 50 ? 'Неплохо, есть над чем поработать' :
      'Попробуйте пройти тест ещё раз';

    return (
      <div className="quiz-screen">
        <button className="back-btn" onClick={onBack}>← На главную</button>
        <div className="question-container results">
          <h2>Результаты теста</h2>
          <p className="subtitle results-theme">Тема: {quizData.title}</p>
          <div className="score-circle">
            {score}/{total}
          </div>
          <p className="results-percentage">{percentage}%</p>
          <p className="results-grade">{gradeMessage}</p>
          <p className="results-summary">
            Правильных ответов: {score} · Ошибок: {total - score}
          </p>

          <div className="results-review">
            <h3>Разбор ответов</h3>
            <ul className="results-list">
              {answerHistory.map((entry, index) => (
                <li
                  key={entry.questionId ?? index}
                  className={`results-item ${entry.isCorrect ? 'results-item--correct' : 'results-item--wrong'}`}
                >
                  <div className="results-item-header">
                    <span className="results-item-num">Вопрос {index + 1}</span>
                    <span className={`results-item-badge ${entry.isCorrect ? 'badge-correct' : 'badge-wrong'}`}>
                      {entry.isCorrect ? 'Верно' : 'Ошибка'}
                    </span>
                  </div>
                  {entry.sourceTitle && (
                    <p className="results-item-source">Из темы: {entry.sourceTitle}</p>
                  )}
                  <p className="results-item-question">{entry.questionText}</p>
                  {!entry.isCorrect && (
                    <p className="results-item-answer">
                      Ваш ответ: <strong>{entry.selectedLabel}</strong>
                      <br />
                      Правильно: <strong>{entry.correctLabel}</strong>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button className="next-btn results-back-btn" onClick={onBack}>
            Вернуться к списку тестов
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx) / quizData.questions.length) * 100;

  const handleOptionClick = (optionKey) => {
    setSelectedOption(optionKey);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correct;
    setAnswerHistory((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id ?? currentQuestionIdx,
        questionText: currentQuestion.question,
        sourceTitle: currentQuestion.sourceTitle,
        selectedKey: selectedOption,
        selectedLabel: currentQuestion.options[selectedOption],
        correctKey: currentQuestion.correct,
        correctLabel: currentQuestion.options[currentQuestion.correct],
        isCorrect,
      },
    ]);

    const isLastQuestion = currentQuestionIdx >= quizData.questions.length - 1;
    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIdx((prev) => prev + 1);
    setSelectedOption(null);
  };

  const getOptionClass = (optionKey) => {
    let className = 'option-btn';
    if (selectedOption === optionKey) className += ' selected';
    return className;
  };

  return (
    <div className="quiz-screen">
      <button className="back-btn" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Назад к списку
      </button>

      <div className="question-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="quiz-meta">
          Вопрос {currentQuestionIdx + 1} из {quizData.questions.length}
        </p>
        {currentQuestion.sourceTitle && (
          <p className="quiz-source">
            Из темы: {currentQuestion.sourceTitle}
          </p>
        )}
        
        <h2 className="question-text">{currentQuestion.question}</h2>

        <div className="options-grid">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <button
              key={key}
              className={getOptionClass(key)}
              onClick={() => handleOptionClick(key)}
            >
              <span className="option-label">{key}.</span> {value}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="next-btn"
          onClick={handleNext}
          disabled={!selectedOption}
        >
          Следующий
        </button>
      </div>
    </div>
  );
};

export default QuizScreen;
