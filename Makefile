# Levanta un contenedor del backend con todos sus prerequisitos (postgres y db inicializada)
# En caso de existir un postgres utilizara ese, y si no se hace pgdown la data persistira
up:
	docker compose -f ./docker-compose.yaml up -d --build --force-recreate backend-myhome.app

# Baja el contenedor y borra los volumes (perdida de data)
down:
	docker compose -f ./docker-compose.yaml down --volumes

# Te conecta a la consola de postgres
pgconsole:
	docker exec -it backend-myhome.pg psql -U myhome -d myhome

# Levanta solo el contenedor con postgres y la base de datos de myhome inicializada
pgup:
	docker compose -f ./docker-compose.yaml up -d --build backend-myhome.pg

# Destruye todos los contenedores y volumenes eliminando persistencia y los levanta nuevamente
restart: down up

# Display logs app
applogs:
	docker logs backend-myhome.app

# Display logs pg
pglogs:
	docker logs backend-myhome.pg


.PHONY: app pgc pgup pgdown