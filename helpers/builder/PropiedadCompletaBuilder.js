const PropiedadCompletaVO = require("../../models/vo/PropiedadCompletaVO.js");

class PropiedadCompletaBuilder {

  constructor() {
    this.entity = new PropiedadCompletaVO();
  }

  property(property) {
    this.entity.idProperty = property.idProperty;
		this.entity.idUsuario = property.idUsuario;
		this.entity.nombre = property.nombre;
		this.entity.descripcion = property.descripcion;
		this.entity.rating = property.rating;
		this.entity.positiveCount = property.positiveCount;
		this.entity.negativeCount = property.negativeCount;
		this.entity.estado = property.estado;
    return this;
  } 
  
  build() {
    return this.entity;
  }
}

module.exports = PropiedadCompletaBuilder;
