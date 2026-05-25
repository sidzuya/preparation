# Тесты по истории искусства

Веб-приложение с тестами по презентациям курса (React + Vite).

## Локальный запуск

```bash
npm install
npm run dev
```

Сайт откроется на `http://localhost:5173`

## Деплой на Vercel (бесплатно, постоянная ссылка)

### 1. Код на GitHub

Репозиторий: `https://github.com/sidzuya/preparation`

Если есть новые изменения локально:

```bash
cd /Users/sidzuya/Desktop/preparation/art-quiz
git add .
git commit -m "Описание изменений"
git push
```

### 2. Подключить Vercel

1. Зайдите на [vercel.com](https://vercel.com) и войдите через **GitHub**.
2. **Add New…** → **Project**.
3. Выберите репозиторий **preparation** (или `art-quiz`, если создадите отдельный).
4. Настройки (обычно подставляются сами для Vite):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Нажмите **Deploy**.

Через 1–2 минуты появится ссылка вида `https://preparation-xxx.vercel.app` — сайт будет работать в интернете, не только на вашем компьютере.

### 3. Обновления

После каждого `git push` в `main` Vercel сам пересоберёт и обновит сайт.

### Деплой из терминала (по желанию)

```bash
npm i -g vercel
cd art-quiz
vercel login
vercel
```

Следуйте подсказкам в терминале.
