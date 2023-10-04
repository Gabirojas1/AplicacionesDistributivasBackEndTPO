class Multimedia {
	
	constructor() {
		this.idContenido = 0
		this.idProperty = 0
		this.tipoContenido = ""
		this.extension = ""
		this.urlContenido = ""
		this.estado = 1
	}

	getIdContenido() {
		return this.idContenido;
	}
	
	getIdProperty() {
		return this.idProperty;
	}

	getTipoContenido() {
		return this.tipoContenido;
	}

	getExtension() {
		return this.extension;
	}

	getUrlContenido() {
		return this.urlContenido;
	}

	getEstado() {
		return this.estado;
	}
}



module.exports = Multimedia;
