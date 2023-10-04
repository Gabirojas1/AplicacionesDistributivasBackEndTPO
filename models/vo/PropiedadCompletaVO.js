class PropiedadCompletaVO {
	
	constructor() {
		this.idProperty = 0;
		this.idUsuario = 0;
		this.nombre = "";
		this.descripcion = "";
		this.rating = 0;
		this.positiveCount = 0;
		this.negativeCount = 0;
		this.estado = 0;
	}

	getIdProperty() {
		return this.idProperty;
	}
	
	getIdUsuario() {
		return this.idUsuario;
	}

	getNombre() {
		return this.nombre;
	}

	getDescripcion() {
		return this.descripcion;
	}

	getRating() {
        return this.rating;
    }

	getPositiveCount() {
        return this.positiveCount;
    }

	getNegativeCount() {
        return this.negativeCount;
    }

	getEstado() {
		return this.estado;
	}
}



module.exports = PropiedadCompletaVO;
