import React, { useState, useEffect } from 'react';
import { ALL_QUIZ_IDS } from '../App';

const QuizScreen = ({ quizId, quizTitle, onBack }) => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Hint state
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

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
    setShowHint(false);
    setHintsUsed(0);

    if (quizId === 'mixed') {
      // Fetch all quizzes
      Promise.all(ALL_QUIZ_IDS.map(id => fetch(`/quizzes/${id}.json`).then(res => res.json())))
        .then(results => {
          let allQuestions = [];
          results.forEach(quiz => {
            if (quiz.questions) {
              const qWithSource = quiz.questions.map(q => ({
                ...q,
                sourceTitle: quiz.title
              }));
              allQuestions = [...allQuestions, ...qWithSource];
            }
          });
          
          // Shuffle all questions and pick 100
          allQuestions = shuffleArray(allQuestions).slice(0, 100);
          
          setQuizData({
            title: 'Смешанный тест (100 случайных вопросов)',
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
    return (
      <div className="quiz-screen loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Загрузка вопросов...</p>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="quiz-screen">
        <button className="back-btn" onClick={onBack}>← Назад</button>
        <div className="question-container" style={{ textAlign: 'center' }}>
          <p>Ошибка загрузки вопросов. Пожалуйста, попробуйте позже.</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = answerHistory.length;
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
          
          {hintsUsed > 0 && (
            <div className="results-hints-used">
              <span>💡 Использовано подсказок: {hintsUsed}</span>
            </div>
          )}

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
                      Ваш ответ: <strong style={{color: 'var(--error)'}}>{entry.selectedLabel}</strong>
                      <br />
                      Правильно: <strong style={{color: 'var(--success)'}}>{entry.correctLabel}</strong>
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

  const handleToggleHint = () => {
    if (!showHint) {
      setHintsUsed(prev => prev + 1);
    }
    setShowHint(!showHint);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correct;
    
    // Save to mistake bank if incorrect
    if (!isCorrect) {
      const mistakeRecord = {
        ...currentQuestion,
        sourceTitle: currentQuestion.sourceTitle || quizData.title
      };
      
      const stored = localStorage.getItem('artQuizMistakeBank');
      let bank = [];
      if (stored) {
        try { bank = JSON.parse(stored); } catch(e) {}
      }
      
      // Prevent duplicates by question id/text
      const exists = bank.find(q => q.question === mistakeRecord.question);
      if (!exists) {
        bank.push(mistakeRecord);
        localStorage.setItem('artQuizMistakeBank', JSON.stringify(bank));
      }
    }

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
    setShowHint(false);
  };

  const getOptionClass = (optionKey) => {
    let className = 'option-btn';
    if (selectedOption === optionKey) className += ' selected';
    return className;
  };

  return (
    <div className="quiz-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Назад
        </button>
        
        {currentQuestionIdx > 0 && (
          <button 
            className="clear-mistakes-btn" 
            style={{ margin: 0 }}
            onClick={() => setIsFinished(true)}
          >
            Завершить досрочно
          </button>
        )}
      </div>

      <div className="question-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <p className="quiz-meta" style={{ marginBottom: 0 }}>
            Вопрос {currentQuestionIdx + 1} из {quizData.questions.length}
          </p>
        </div>
        
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
              <span className="option-label">{key}</span> 
              <span>{value}</span>
            </button>
          ))}
        </div>

        {currentQuestion.hint && (
          <>
            <button 
              className="hint-toggle" 
              onClick={handleToggleHint}
            >
              <span className="hint-icon">💡</span> {showHint ? "Скрыть подсказку" : "Показать подсказку"}
            </button>
            {showHint && (
              <div className="hint-box">
                {currentQuestion.hint}
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="next-btn"
          onClick={handleNext}
          disabled={!selectedOption}
        >
          {currentQuestionIdx >= quizData.questions.length - 1 ? 'Завершить тест' : 'Следующий вопрос'}
        </button>
      </div>
    </div>
  );
};

export default QuizScreen;
