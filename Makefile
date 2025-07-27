.PHONY: start stop network

network:
	docker network inspect quizmaker-network >/dev/null 2>&1 || docker network create quizmaker-network

start: network
	docker-compose up -d --build

stop:
	docker-compose down
