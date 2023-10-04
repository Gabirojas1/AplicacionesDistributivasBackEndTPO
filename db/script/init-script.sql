create user root with encrypted password '1234';
grant all privileges on database myhome to myhome;
grant all privileges on database myhome to root;

\connect myhome

CREATE TABLE usuarios(
	idUsuario int GENERATED ALWAYS AS IDENTITY CONSTRAINT pk_usuarios PRIMARY KEY,
	mail VARCHAR(150) UNIQUE,
	nickname VARCHAR(100)  NOT NULL,
	habilitado VARCHAR(2) CONSTRAINT chk_habilitado CHECK (habilitado in ('Si','No')) default 'Si',
	nombre VARCHAR(150),
	password VARCHAR(500),
	avatar VARCHAR(300),
	tipo_usuario VARCHAR(10) CONSTRAINT chk_tipo_usuario CHECK (tipo_usuario in ('Inmobiliaria','Usuario')),
	otp VARCHAR(100)
);

CREATE TABLE properties(
	idProperty int NOT NULL GENERATED ALWAYS AS IDENTITY CONSTRAINT pk_properties PRIMARY KEY,
	idUsuario int,
	nombre VARCHAR(500),
	descripcion VARCHAR(1000),
	rating int default 0,
	positiveCount int default 0,
	negativeCount int default 0,
	estado int default 1,
	CONSTRAINT fk_properties_usuarios foreign key (idUsuario) references usuarios
);

CREATE TABLE calificaciones(
	idCalificacion int NOT NULL GENERATED ALWAYS AS IDENTITY CONSTRAINT pk_calificaciones PRIMARY KEY,
	idUsuario int,
	idProperty int,
	calificacion int,
	comentarios VARCHAR(500),
	CONSTRAINT fk_calificaciones_usuarios foreign key (idUsuario) references usuarios,
	CONSTRAINT fk_calificaciones_properties foreign key (idProperty) references properties
);

CREATE TABLE fotos(
	idfoto int NOT NULL GENERATED ALWAYS AS IDENTITY CONSTRAINT pk_fotos PRIMARY KEY,
	idProperty int NOT NULL,
	urlFoto VARCHAR(300),
	extension VARCHAR(5),
	CONSTRAINT fk_fotos_properties foreign key (idProperty) references properties
);

CREATE TABLE multimedia(
	idContenido int NOT NULL GENERATED ALWAYS AS IDENTITY CONSTRAINT pk_multimedia PRIMARY KEY,
	idProperty int NOT NULL,
	tipoContenido VARCHAR(10) CONSTRAINT chk_tipo_contenido CHECK (tipoContenido in ('foto','video','audio')),
	extension VARCHAR(5),
	urlContenido VARCHAR(300),
	estado int default 1,
	CONSTRAINT fk_multimedia_property foreign key (idProperty) references properties
);

INSERT INTO usuarios(idUsuario, mail, nickname, habilitado, nombre, password, avatar, tipo_usuario) 
OVERRIDING SYSTEM VALUE
VALUES(999999999, 'usuario@uade.edu.ar', 'usuario', 'Si', 'usuario', '$2b$06$Nqq5r0jxYW8YO6K7d83ug.9fvDcLF3Ul3uzrXhC/ty9K5UZKW2F1a', ' ', 'Usuario');