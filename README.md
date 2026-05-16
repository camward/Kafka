# Kafka

## Docker

```bash
# поднять окружение
$ docker compose up -d
```

## Пересоздать контейнеры с очисткой томов

```bash
docker compose down -v
docker compose up -d
```

## Producer

```bash
# перейти в папку producer
$ cd producer

# установить зависимости
$ npm i

# запустить приложение
$ npm run dev
```

## Consumer

```bash
# перейти в папку consumer
$ cd consumer

# установить зависимости
$ npm i

# запустить приложение
$ npm run dev
```

## UI

```bash
# перейти в папку ui
$ cd ui

# установить зависимости
$ npm i

# запустить приложение
$ npm run dev
```