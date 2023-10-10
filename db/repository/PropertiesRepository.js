const Property = require('../../models/Property');

/**
* Creates User with the given data
* @returns account created
*/
const getProperties = async ({ idProperty, idUsuario, title, description,
	antiquity, mtsCovered, mtsUnconvered, position, orientation, numEnvironments,
	numRooms, numBathrooms, numCars, roofTop, balcony, vault, status,
	rating_min, order_by, order_type, skip, limit }) => {

	let result = [];

	var whereStatement = {};
	whereStatement.status = "Publicada";

	if (idProperty)
		whereStatement.idProperty = idProperty;

	if (idUsuario)
		whereStatement.idUsuario = idUsuario;

	if (title) {
		whereStatement.title = {
			[Op.like]: `${title}`
		};
	}

	if (description) {
		whereStatement.description = {
			[Op.like]: `${description}`
		};
	}

	let orderStatement = ['updatedAt', 'DESC']
	if (order_by && order_type) {
		if (order_by == 'rating') {
			orderStatement = [positiveCount + negativeCount, order_type]
		} else {
			orderStatement = [order_type, order_type]
		}
	}

	await Property.findAll({
		where: whereStatement,
		order: [orderStatement],
		offset: skip,
		limit: limit
	}).then(res => {
		result = res;
	}).catch((error) => {
		console.error('Failed to retrieve data : ', error);
	});

	return result;


	// try {

	// 	// Se filtra por los campos recibidos en el body.
	// 	let query = "SELECT r.* FROM properties WHERE r.estado = 1 ";

	// 	if (nombre) {
	// 		query = query + ` AND (r.nombre LIKE '%${nombre}%' `
	// 		query = query + ` OR r.descripcion LIKE '%${nombre}%' ) `
	// 	}

	// 	if (rating_min) {
	// 		query = query + ` AND r.rating > '${rating_min}' `
	// 	}

	// 	// ejecuta query
	// 	const records = await pg_pool.query(query);

	// 	// obtenemos los resultados y creamos los value object de respuesta
	// 	let result = [];
	// 	for (const record of records.rows) {

	// 	}
};

// Agrega propiedad
const addProperty = async ({ idUsuario, propertyType, modalType, title, description }) => {
	// antiquity, mtsCovered, mtsHalfCovered, mtsUncovered, position,
	// orientation, numEnvironments, numRooms, numBathrooms, numCars, roofTop, balcony, vault, status

	let property = null;

	if (idUsuario == undefined || idUsuario.length < 1) {
		return null
	}

	await Property.create({
		idUsuario: idUsuario,
		propertyType: propertyType,
		modalType: modalType,
		title: title,
		description: description,
		status: "Initial_1",
	}).then(res => {
		property = res;
	}).catch((error) => {
		console.error('Failed to retrieve data : ', error);
	});

	return property;
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
const deleteProperty = async ({ idProperty }) => {
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