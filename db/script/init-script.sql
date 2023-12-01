create user root with encrypted password '1234';
grant all privileges on database myhome to myhome;
grant all privileges on database myhome to root;
CREATE EXTENSION postgis;

\connect myhome