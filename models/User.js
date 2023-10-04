class User {
  constructor() {
    this.idUsuario = 0;
    this.nombre = "";
    this.mail = "";
    this.nickname = "";
    this.password = "";
    this.habilitado = "No";
    this.avatar = "";
    this.tipo_usuario = "Usuario";
  }

  getIdUsuario() {
    return this.idUsuario;
  }

  getMail() {
    return this.mail;
  }

  getNickname() {
    return this.mail;
  }

  getPassword() {
    return this.password;
  }

  getNombre() {
    return this.nombre;
  }

  getHabilitado() {
    return this.habilitado;
  }

  getAvatar() {
    return this.avatar;
  }
}

module.exports = User;
