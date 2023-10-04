const User = require("../../models/User");

class UserBuilder {

  constructor() {
    this.entity = new User();
  }

  idusuario(idusuario) {
    this.entity.idusuario = idusuario;
    return this;
  } 

  mail(mail) {
    this.entity.mail = mail;
    return this;
  }

  nickname(nickname) {
    this.entity.nickname = nickname;
    return this;
  } 

  password(password) {
    this.entity.password = password;
    return this;
  } 

  
  nombre(nombre) {
    this.entity.nombre = nombre;
    return this;
  }

  avatar(avatar) {
    this.entity.avatar = avatar;
    return this;
  }

  tipo_usuario(tipo_usuario) {
    this.entity.tipo_usuario = tipo_usuario;
    return this;
  }

  habilitado(habilitado) {
    this.entity.habilitado = habilitado;
    return this;
  }

  build() {
    return this.entity;
  }

  buildWithRecord(record) {

    return new UserBuilder()
			.idusuario(record.idusuario)
			.mail(record.mail)
      .password(record.password)
			.nickname(record.nickname)
			.habilitado(record.habilitado)
			.build();

  }
}

module.exports = UserBuilder;
