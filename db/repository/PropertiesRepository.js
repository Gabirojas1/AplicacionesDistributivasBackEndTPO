const { pg_pool } = require('../database')


/**
* Creates User with the given data
* @returns account created
*/
const getProperties = async ({property_id, usuario_id, nombre, rating_min, order_by, order_type, skip, limit}) => {
	try {

		// Se filtra por los campos recibidos en el body.
		let query = "SELECT r.* FROM properties WHERE r.estado = 1 ";		
		
		if (property_id) {
			query = query + ` AND r.idProperty = '${property_id}' `
		}
		
		if (usuario_id) {
			query = query + ` AND r.idUsuario = '${usuario_id}' `
		}
		
		if (nombre) {
			query = query + ` AND (r.nombre LIKE '%${nombre}%' `
			query = query + ` OR r.descripcion LIKE '%${nombre}%' ) `
		}
				
		if (rating_min) {
			query = query + ` AND r.rating > '${rating_min}' `
		}

		// TODO validate field exists
		if(order_by && order_type) {
			if (order_by == 'rating') {
				query = query + ` ORDER BY rating, positiveCount+negativeCount ${order_type} `
			} else {
				query = query + ` ORDER BY ${order_by} ${order_type} `
			}
		}

		if (skip) {
			query = query + ` OFFSET ${skip} `
		}

		if (limit) {
			query = query + ` LIMIT ${limit} `
		}

		// ejecuta query
		const records = await pg_pool.query(query);

		// obtenemos los resultados y creamos los value object de respuesta
		let result = [];
		for (const record of records.rows) {

		}

		return result;
	} catch (error) {
		return [];
	}
};

// Agrega propiedad
const addProperty = async ({idUsuario, nombre,descripcion,tipo,foto,porciones,cantidadPersonas}) => {
	try {

		let query = ` INSERT INTO properties(idUsuario, nombre, descripcion) `
		query = query  + ` VALUES('${idUsuario}', '${nombre}', '${descripcion}') RETURNING *`;
		const records = await pg_pool.query(query);
		if (records.rows.length >= 1) {
			let record = records.rows[0];

			
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
};

// actualiza propiedad existente
const updateProperty = async (body) => {
	try {

		var clone = JSON.parse(JSON.stringify(body));
		delete clone.idProperty;
		delete clone.idUsuario;
		delete clone.tipo;

		let query = ` UPDATE propertiesSET `

		// generar parte del SET dinamicamente
		let i = 1;
		for (let key in clone) {
			query = query + `${key} = '${body[key]}'`
			if (i != Object.keys(clone).length) {
				query = query + ", "
			}
			i++;
		}

		query = query + ` WHERE idProperty = '${body.idProperty}' RETURNING * `;
		
		const records = await pg_pool.query(query);
		if (records.rows.length >= 1) {
			let record = records.rows[0];

			
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
};

// Elimina propiedad existente
const deleteProperty = async ({idProperty}) => {
	try {

		let query = ` UPDATE propertiesSET estado = 0 WHERE idProperty = '${idProperty}' `;
		const records = await pg_pool.query(query);
		if (records.rowCount >= 1) {
			return true
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
};


module.exports = {
	getProperties,
	addProperty,
	updateProperty,
	deleteProperty,
};