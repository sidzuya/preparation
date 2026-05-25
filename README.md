# Тесты по истории искусства

Веб-приложение с тестами по презентациям курса (React + Vite).

## Локальный запуск

```bash
npm install
npm run dev
```

Сайт откроется на `http://localhost:5173`

## Деплой на Railway

1. Залейте этот проект в GitHub (см. инструкцию ниже).
2. Зайдите на [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Выберите репозиторий `art-quiz`.
4. Railway сам определит Node.js: команда сборки `npm run build`, запуск `npm run start`.
5. В настройках сервиса включите **Generate Domain** — появится постоянная ссылка на сайт.

## Публикация на GitHub (первый раз)

В терминале из папки проекта:

```bash
cd art-quiz
git init
git add .
git commit -m "Initial commit: art history quiz app"

# Создайте пустой репозиторий на github.com (без README), затем:
git remote add origin https://github.com/ВАШ_ЛОГИН/art-quiz.git
git branch -M main
git push -u origin main
```

Замените `ВАШ_ЛОГИН` на свой логин GitHub.
