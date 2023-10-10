# Endpoints
/auths \
/users \
/properties

# Commands

Requerimientos: 
- Docker, docker compose
- Makefile (opcional)

## Iniciar app & db

> docker compose up -d --build --force-recreate backend-myhome.app 

Con Makefile:

    make up

# Eliminar contenedores y db

> docker rm -f $(docker ps -a -q) --volumes

ó 
> docker compose -f ./docker-compose.yaml down --volumes



Option 2 con Makefile: 

    make down


# postgres

Para acceder a postgres:

Option 1: 
1. > docker exec -it backend-myhome.pg /bin/bash
2. > psql -U root -d myhome

Option 2 (con Makefile):

    make pgconsole
  
Comandos útiles postgres:
> \du+
list all users 

> \l
list all databases

> \c myhome
switch to myhome database

> \dt
list all tables