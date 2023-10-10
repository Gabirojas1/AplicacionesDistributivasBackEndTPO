const Property = require('../../models/Property');
const { Op, where } = require('sequelize');

/**
* Gets properties by filtering query
* @returns List of properties
*/
const getProperties = async ({ idProperty, idUsuario, title, description,
	antiquity, mtsCovered, mtsUnconvered, position, orientation, numEnvironments,
	numRooms, numBathrooms, numCars, roofTop, balcony, vault, filterOwned,
	minRating, orderBy, orderType, skip, limit }) => {

	let result = [];

	var whereStatement = {};

	if (!filterOwned) {
		whereStatement.status = "Publicada";
	}

	if (idUsuario)
		whereStatement.idUsuario = idUsuario;

	if (idProperty)
		whereStatement.idProperty = idProperty;

	if (title) {
		whereStatement.title = {
			[Op.iLike]: "%" + title + "%"
		};
	}

	if (description) {
		whereStatement.description = {
			[Op.iLike]: "%" + description + "%"
		};
	}

	if (minRating) {
		whereStatement.rating = {
			[Op.gte]: minRating
		};
	}

	let orderStatement = ['updatedAt', 'DESC']
	if (orderBy && orderType) {
		if (orderBy == 'rating') {
			orderStatement = [positiveCount + negativeCount, orderType]
		} else {
			orderStatement = [orderBy, orderType]
		}
	}

	await Property.findAll({
		where: whereStatement,
		order: [orderStatement],
		offset: skip,
		limit: limit
	}).then(res => {
		result = res;

		// TODO!
		// obtenemos los resultados y creamos los
		// value object de respuesta (complete property VO)
		// 	let result = [];
		// 	for (const record of res.rows) {

		// 	}


	}).catch((error) => {
		console.error('Failed to retrieve data : ', error);
	});

	return result;
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
const updateProperty = async (property, data) => {
	await property.update(data);
	await property.save();
	return property;
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