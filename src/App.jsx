import React, { useState } from 'react';
import QuizScreen from './components/QuizScreen';

const QUIZ_SECTIONS = [
  {
    id: 'general',
    title: 'Общий тест',
    description: 'Вопросы из всех презентаций курса',
    quizzes: [
      { id: 'mixed', title: 'Смешанный тест', subtitle: '50 случайных вопросов', isSpecial: true },
    ],
  },
  {
    id: 'ancient',
    title: 'Древний мир',
    description: 'Первобытность, Египет, Греция, Рим, Крит и Микены',
    quizzes: [
      { id: 'quiz_1', title: 'Первобытное искусство', subtitle: 'Презентация 1' },
      { id: 'quiz_17', title: 'Крито-минойская цивилизация', subtitle: 'Отдельная тема' },
      { id: 'quiz_2', title: 'Искусство древнего Египта', subtitle: 'Презентация 2' },
      { id: 'quiz_3', title: 'Искусство древней Греции', subtitle: 'Презентация 3' },
      { id: 'quiz_4', title: 'Искусство древнего Рима', subtitle: 'Презентация 4' },
    ],
  },
  {
    id: 'medieval-renaissance',
    title: 'Средние века и Новое время',
    description: 'Средневековье, Возрождение, барокко, классицизм, рококо',
    quizzes: [
      { id: 'quiz_5', title: 'Искусство Средневековья', subtitle: 'Презентация 5' },
      { id: 'quiz_7', title: 'Эпоха Возрождения', subtitle: 'Презентация 6, ч. 1' },
      { id: 'quiz_6', title: 'Эпоха Возрождения', subtitle: 'Презентация 6, ч. 2' },
      { id: 'quiz_8', title: 'Барокко', subtitle: 'Презентация 7' },
      { id: 'quiz_9', title: 'Классицизм', subtitle: 'Презентация 8' },
      { id: 'quiz_15', title: 'Рококо и романтизм', subtitle: 'Презентация 8 (продолжение)' },
    ],
  },
  {
    id: 'russian',
    title: 'Русское искусство',
    description: 'От древнерусской иконы до XIX века',
    quizzes: [
      { id: 'quiz_10', title: 'Русское искусство', subtitle: 'Презентация 10' },
    ],
  },
  {
    id: 'modern',
    title: 'Искусство XIX–XXI века',
    description: 'Западное искусство нового и современного времени',
    quizzes: [
      { id: 'quiz_11', title: 'Искусство XIX–XX века', subtitle: 'Презентация 11' },
      { id: 'quiz_12', title: 'Искусство XX–XXI века', subtitle: 'Презентация 12' },
    ],
  },
  {
    id: 'kazakh',
    title: 'Казахское искусство',
    description: 'Традиции, орнамент, степная культура',
    quizzes: [
      { id: 'quiz_13', title: 'Казахское искусство', subtitle: 'Презентация 13, ч. 1' },
      { id: 'quiz_14', title: 'Казахское искусство', subtitle: 'Презентация 14, ч. 2' },
      { id: 'quiz_16', title: 'The Steppe Code', subtitle: 'Орнамент и символика' },
    ],
  },
  {
    id: 'basics',
    title: 'Основы',
    description: 'Общие понятия курса',
    quizzes: [
      { id: 'quiz_18', title: 'Жанры изобразительного искусства', subtitle: 'Справочная тема' },
    ],
  },
];

export const ALL_QUIZ_IDS = QUIZ_SECTIONS.flatMap((section) =>
  section.quizzes.filter((q) => !q.isSpecial).map((q) => q.id)
);

function App() {
  const [activeQuiz, setActiveQuiz] = useState(null);

  return (
    <div className="app-container">
      {activeQuiz ? (
        <QuizScreen
          quizId={activeQuiz.id}
          quizTitle={activeQuiz.title}
          onBack={() => setActiveQuiz(null)}
        />
      ) : (
        <>
          <header>
            <h1>Тесты по истории искусства</h1>
            <p className="subtitle">Выберите раздел и пройдите тест по нужной презентации</p>
          </header>

          <div className="quiz-sections">
            {QUIZ_SECTIONS.map((section) => (
              <section key={section.id} className="quiz-section">
                <div className="section-header">
                  <h2 className="section-title">{section.title}</h2>
                  <p className="section-desc">{section.description}</p>
                </div>
                <div className={`quiz-grid ${section.quizzes.length === 1 ? 'quiz-grid--single' : ''}`}>
                  {section.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className={`card ${quiz.isSpecial ? 'special-card' : ''}`}
                      onClick={() => setActiveQuiz(quiz)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveQuiz(quiz);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <h3>{quiz.title}</h3>
                      <p>{quiz.subtitle}</p>
                      <button type="button" className="play-btn">
                        Пройти тест
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
