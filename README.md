<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<h1 align="center">AllTrack</h1>

<p align="center">
  <strong>Система каталогизации медиаконтента</strong> — бэкенд для отслеживания фильмов, сериалов, аниме, игр, книг и другого цифрового контента с поддержкой полного CRUD.
</p>

<p align="center">
  <a href="https://github.com/PartyCorn/AllTrack/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/PartyCorn/AllTrack?style=flat-square" alt="License">
  </a>
</p>

---

### Возможности

- 📚 Управление тайтлами (фильмы, сериалы, аниме, игры, книги, другое)
- 🎯 Отслеживание статуса просмотра/прохождения
- ⭐ Избранное и оценки
- 🎮 Франшизы и связывание тайтлов
- 👥 Друзья и социальные функции
- 🔔 Уведомления
- 🏆 Система достижений и уровней профиля
- 💬 Комментарии на профилях

---

## Технологический стек

| Категория | Технология |
| ------------------ | -------------------- |
| **Backend**        | NestJS               |
| **ORM**            | Prisma               |
| **Database**       | PostgreSQL           |
| **Authentication** | JWT (Passport)       |
| **API Docs**       | Swagger              |
| **Validation**     | class-validator      |
| **Scheduling**     | NestJS Schedule      |

---

## Требования

- Node.js 20.19+ (для поддержки Prisma)
- PostgreSQL 14+

---

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/PartyCorn/AllTrack.git
cd AllTrack
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных PostgreSQL

#### Способ А: Локальный PostgreSQL

1. Установите [PostgreSQL](https://www.postgresql.org/download/) (версия 14+) или [pgAdmin4](https://www.pgadmin.org/download/pgadmin-4-windows/)
2. Создайте базу данных:
   
   ```bash
   createdb alltrack
   ```
3. Создайте пользователя (или используйте существующего):
   
   ```bash
   psql -U postgres -c "CREATE USER postgres WITH PASSWORD 'password';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE alltrack TO postgres;"
   ```
4. Настройте подключение в `.env`:
   
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/alltrack"
   JWT_SECRET=your-secret-key
   ```

#### Способ Б: Docker

```bash
docker run -d \
  --name alltrack-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=alltrack \
  -p 5432:5432 \
  postgres:14
```

### 4. Применение миграций и генерация клиента

```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций Prisma
npx prisma migrate dev --name init

# Заполнение базы достижениями
npm run seed
```

### 5. Запуск приложения

```bash
# Режим разработки
npm run start:dev

# Или просто
npm run start
```

Приложение будет доступно по адресу: `http://localhost:3000`

---

## API документация

После запуска документация доступна по адресу: `http://localhost:3000/docs`

---

## Структура проекта

```
src/
├── auth/              # Аутентификация (JWT)
├── achievements/      # Система достижений
├── comments/          # Комментарии к профилям
├── common/            # Общие утилиты, guards, DTO
├── config/            # Конфигурация
├── franchises/        # Франшизы
├── friends/           # Друзья
├── gamification/      # Геймификация (XP, уровни)
├── kinopoisk/         # Поиск по Кинопоиску
├── notifications/     # Уведомления
├── prisma/            # Сервис Prisma
├── titles/            # Тайтлы (основная сущность)
└── users/             # Пользователи
```

---

## Основные эндпоинты

| Метод        | Роут                         | Описание                                                      |
| ----------------- | -------------------------------- | --------------------------------------------------------------------- |
| **Авторизация**          |                                  |                                                                       |
| `POST`            | `/auth/register`                 | Регистрация                                                |
| `POST`            | `/auth/login`                    | Вход                                                              |
| **Достижения**  |                                  |                                                                       |
| `GET`             | `/achievements`                  | Все достижения                                           |
| `GET`             | `/achievements/:nickname`        | Достижения пользователя                         |
| **Комментарии**      |                                  |                                                                       |
| `POST`            | `/comments/profile/:profileId`   | Оставить комментарий                               |
| `GET`             | `/comments/profile/:profileId`   | Комментарии профиля                                 |
| `PUT`             | `/comments/:profileId`           | Редактировать комментарий                     |
| `DELETE`          | `/comments/:profileId`           | Удалить комментарий                                 |
| **Франшизы**    |                                  |                                                                       |
| `GET`             | `/titles/user/:userId`           | Франшизы пользователя                             |
| `POST`            | `/titles`                        | Создать франшизу                                       |
| `GET`             | `/titles/:id`                    | Франшиза по ID                                              |
| `PUT`             | `/titles/:id`                    | Обновить франшизу                                     |
| `DELETE`          | `/titles/:id`                    | Удалить франшизу                                       |
| `POST`            | `/titles`                        | Прикрепить тайтл                                       |
| `DELETE`          | `/titles/:id`                    | Открепить тайтл                                         |
| **Друзья**       |                                  |                                                                       |
| `GET`             | `/friends`                       | Список друзей                                             |
| `GET`             | `/friends/requests/incoming`     | Входящие заявки                                         |
| `GET`             | `/friends/requests/outcoming`    | Исходящие заявки                                       |
| `POST`            | `/friends/request/:nickname`     | Отправить заявку                                       |
| `PUT`             | `/friends/accept/:friendId`      | Принять заявку                                           |
| `DELETE`          | `/friends/:friendId`             | Удалить друга или отклонить заявку      |
| **Кинопоиск**        |                                  |                                                                       |
| `GET`             | `/kinopoisk/search`                 | Поиск по названию                                             |
| `GET`             | `/kinopoisk/:id/seasons`                 | Получить сезоны и эпизоды                                             |
| **Уведомления** |                                  |                                                                       |
| `GET`             | `/notifications/me`              | Уведомления                                                |
| `PUT`             | `/notifications/me/read`         | Прочитать выборочно                                 |
| `PUT`             | `/notifications/me/read-all`     | Прочитать все                                             |
| `GET`             | `/notifications/me/stream`       | Real-time SSE                                                         |
| **Тайтлы**        |                                  |                                                                       |
| `GET`             | `/titles/search`                 | Поиск тайтлов с фильтрами                       |
| `GET`             | `/titles/user/:userId`           | Тайтлы пользователя                                 |
| `GET`             | `/titles/user/:userId/favorites` | Только избранные тайтлы пользователя |
| `POST`            | `/titles`                        | Создать франшизу                                       |
| `GET`             | `/titles/:id`                    | Франшиза по ID                                              |
| `PUT`             | `/titles/:id`                    | Обновить тайтл                                           |
| `DELETE`          | `/titles/:id`                    | Удалить тайтл                                             |
| **Пользователи**         |                                  |                                                                       |
| `GET`             | `/users/me`                      | Профиль текущего пользователя              |
| `PUT`             | `/users/me/edit`                 | Редактирование профиля                           |
| `GET`             | `/users/:nickname`               | Публичный профиль                                     |
| `GET`             | `/users/me/export`               | Экспорт данных пользователя                  |

---

## Доступные npm-скрипты

```bash
npm run start           # Запуск в production
npm run start:dev       # Режим разработки (hot-reload)
npm run start:debug     # Режим отладки
npm run build           # Сборка проекта
npm run lint            # Линтинг и исправление
npm run test            # Unit тесты
npm run test:cov        # Покрытие тестами
npm run test:e2e        # E2E тесты
npm run seed            # Заполнение БД (achievements)
```

---

## Переменные окружения

| Переменная | Описание                                  | По умолчанию |
| -------------------- | ------------------------------------------------- | ----------------------- |
| `DATABASE_URL`       | Строка подключения к PostgreSQL | `postgresql://...`      |
| `JWT_SECRET`         | Секретный ключ для JWT            | `super-secret-key`      |

---

## Лицензия

Только для просмотра, копирование и использование в своих целях запрещено. Полный текст — в файле [LICENSE](LICENSE).

---

<p align="center">
  Сделано с ❤️<br>&copy Курилов Андрей - 2026
</p>

