const Property = require("../../models/Property.js");

class PropiedadBuilder {

  constructor() {
    this.entity = new Property();
  }

  idProperty(idProperty) {
    this.entity.idProperty = idProperty;
    return this;
  } 

  idUsuario(idUsuario) {
    this.entity.idUsuario = idUsuario;
    return this;
  } 

  nombre(nombre) {
    this.entity.nombre = nombre;
    return this;
  } 

  descripcion(descripcion) {
    this.entity.descripcion = descripcion;
    return this;
  } 

  rating(rating) {
    this.entity.rating = rating;
    return this;
  } 

  positiveCount(positiveCount) {
    this.entity.positiveCount = positiveCount;
    return this;
  } 

  negativeCount(negativeCount) {
    this.entity.negativeCount = negativeCount;
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

    return new PropiedadBuilder()
      .idProperty(record.idproperty)
      .idUsuario(record.idusuario)
      .nombre(record.nombre)
			.descripcion(record.descripcion)
      .rating(record.rating)
      .positiveCount(record.positivecount)
      .negativeCount(record.negativecount)
      .estado(record.estado)
			.build();
  }
}

module.exports = PropiedadBuilder;
