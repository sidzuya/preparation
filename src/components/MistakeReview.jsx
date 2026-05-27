import React, { useState, useEffect } from 'react';

const MistakeReview = ({ onBack }) => {
  const [mistakes, setMistakes] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  useEffect(() => {
    const stored = localStorage.getItem('artQuizMistakeBank');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMistakes(parsed);
      } catch (e) {
        console.error("Error parsing mistakes", e);
      }
    }
  }, []);

  if (mistakes.length === 0) {
    return (
      <div className="quiz-screen">
        <button className="back-btn" onClick={onBack}>← На главную</button>
        <div className="question-container">
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Ошибок пока нет! 🎉</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Вы отлично справляетесь или еще не начинали проходить тесты. Возвращайтесь сюда позже!
          </p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (feedback === 'correct') {
      // Remove this question from mistakes
      const updatedMistakes = [...mistakes];
      updatedMistakes.splice(currentIdx, 1);
      
      setMistakes(updatedMistakes);
      localStorage.setItem('artQuizMistakeBank', JSON.stringify(updatedMistakes));
      
      if (currentIdx >= updatedMistakes.length) {
        setCurrentIdx(0);
      }
    } else {
      // Move to next
      setCurrentIdx((prev) => (prev + 1) % mistakes.length);
    }
    
    setFeedback(null);
    setSelectedOption(null);
    setShowHint(false);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQuestion.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const handleClearAll = () => {
    if (confirm("Вы уверены, что хотите удалить все вопросы из работы над ошибками?")) {
      setMistakes([]);
      localStorage.removeItem('artQuizMistakeBank');
    }
  };

  const currentQuestion = mistakes[currentIdx];

  const getOptionClass = (key) => {
    let className = 'option-btn';
    if (selectedOption === key) {
      className += ' selected';
      if (feedback === 'correct') className += ' results-item--correct';
      if (feedback === 'wrong') className += ' results-item--wrong';
    } else if (feedback !== null && key === currentQuestion.correct) {
      // highlight correct option if answered wrong
      className += ' results-item--correct';
    }
    return className;
  };

  return (
    <div className="quiz-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={onBack}>← На главную</button>
        <button className="clear-mistakes-btn" style={{ margin: 0 }} onClick={handleClearAll}>
          Очистить банк ошибок
        </button>
      </div>

      <div className="question-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((mistakes.length - mistakes.length + currentIdx + 1) / mistakes.length) * 100}%` }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="quiz-meta">
            Работа над ошибками: осталось {mistakes.length} вопросов
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
              onClick={() => { if (!feedback) setSelectedOption(key) }}
              disabled={feedback !== null}
            >
              <span className="option-label">{key}.</span> {value}
            </button>
          ))}
        </div>

        {feedback === 'correct' && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', color: 'var(--success)' }}>
            Верно! Вопрос будет удален из банка ошибок.
          </div>
        )}
        
        {feedback === 'wrong' && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--radius-sm)', color: 'var(--error)' }}>
            Ошибка! Правильный ответ: {currentQuestion.options[currentQuestion.correct]}. Вопрос остается в банке.
          </div>
        )}

        {currentQuestion.hint && !feedback && (
          <>
            <button 
              className="hint-toggle" 
              onClick={() => setShowHint(!showHint)}
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

        {feedback === null ? (
          <button
            type="button"
            className="next-btn"
            onClick={handleCheck}
            disabled={!selectedOption}
          >
            Проверить
          </button>
        ) : (
          <button
            type="button"
            className="next-btn"
            onClick={handleNext}
          >
            Следующий вопрос
          </button>
        )}
      </div>
    </div>
  );
};

export default MistakeReview;
