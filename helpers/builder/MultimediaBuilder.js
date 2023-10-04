const Multimedia = require("../../models/Multimedia");

class MultimediaBuilder {

  constructor() {
    this.entity = new Multimedia();
  }

  idContenido(idContenido) {
    this.entity.idContenido = idContenido;
    return this;
  } 

  idProperty(idProperty) {
    this.entity.idProperty = idProperty;
    return this;
  } 

  tipoContenido(tipoContenido) {
    this.entity.tipoContenido = tipoContenido;
    return this;
  } 

  urlContenido(urlContenido) {
    this.entity.urlContenido = urlContenido;
    return this;
  }

  extension(extension) {
    this.entity.extension = extension;
    return this;
  }

  estado(estado) {
    this.entity.estado = estado;
    return this;
  } 

  build() {
    return this.entity;
  }

  buildWithRecord(record) {

    return new MultimediaBuilder()
      .idContenido(record.idcontenido)
      .idProperty(record.idproperty)
      .tipoContenido(record.tipocontenido)
      .urlContenido(record.urlcontenido)
      .extension(record.extension)
      .estado(record.estado)
			.build();
  }
}

module.exports = MultimediaBuilder;
