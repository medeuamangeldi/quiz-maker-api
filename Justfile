start:
    docker-compose up -d app db --build

stop:
    docker-compose down

start-db:
    docker-compose up -d db

migrate-dev:
    docker-compose run --rm app npx prisma migrate dev --name init
