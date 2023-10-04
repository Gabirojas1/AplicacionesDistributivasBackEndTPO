# Endpoints \
/auths \
/properties \


# DOCKER\

## bring up containers (app & pg)\
cd dev \
docker compose up -d --build --force-recreate myhome.app \

## delete containers (--volumes to delete database volumes also) \
cd dev \
docker rm -f $(docker ps -a -q) --volumes \

# POSTGRES \
## Access postgres (in order) \
docker exec -it myhome.pg /bin/bash \
psql -U root -d myhome \

## \du+ \
list all users \

## \l  \
list all databases  \

## \c myhome  \
switch to myhome database  \

## \dt  \
list all tables  \
