const constants = require('../../common/constants');
const Property = require('../../models/Property');
const { Op, where } = require('sequelize');
const User = require('../../models/User');

/**
* Gets properties by filtering query
* @returns List of properties
*/
const getProperties = async ({ propertyId, id, title, description,
	antiquity, mtsCovered, mtsUnconvered, position, orientation, numEnvironments,
	numRooms, numBathrooms, numCars, roofTop, balcony, vault, filterOwned,
	minRating, orderBy, orderType, skip, limit }) => {

	let result = [];

	var whereStatement = {};
	
	if (id)
		whereStatement.userId = id;

	if (propertyId)
		whereStatement.propertyId = propertyId;

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

	if (!filterOwned) {
		whereStatement.status = "Publicada";
	}

	var findStatement = {
		where: whereStatement,
		order: [orderStatement],
		offset: skip,
		limit: limit
	};

	// if (!filterOwned) {
	// 	findStatement.include = 'user';
	// }

	await Property.findAll(findStatement).then(res => {
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

/**
 * Agrega propiedad con informacion básica o información completa.
 * Los campos mínimos obligatorios son los que no pueden ser null en la base de datos:
 * 
 * - id: obtenido automaticamente con el token de Authorization. 
 * Es el id del usuario loggeado y se utilizara para adjudicarle la propiedad a crear.
 * - propertyType: Tipo de Propiedad (Casa, Depto, etc)
 * - title: titulo principal a mostrar de la propiedad.
 * - descripcion: breve descripcion del estado de la propiedad.
 * 
 * Se pueden recibir mas campos especificados en el body pero no son obligatorios.
 * 
 * El estado de la propiedad es automáticamente definido a través de State Pattern
 * según los campos enviados en ProperyState.js.
 * 
 * El estado inicial con los campos mínimos necesarios es INITIAL_1.
 * 
 * @param {} body campos a utilizar para dar de alta la propiedad. reference: ../Models/Property.js 
 * @returns 
 */
const addProperty = async (body) => {
	let result = null;


	// Crearla con la info del body.
    var clone = JSON.parse(JSON.stringify(body));
	clone.userId = body.id;
    delete clone.id;

	await Property.create(clone)
		.then(res => {
			result = res;

			// Type.create();

		})
		.catch((error) => {
			console.error('Failed to retrieve data : ', error);
		});

	return result;
};

// actualiza propiedad existente
const updateProperty = async (property, data) => {
	await property.update(data);
	await property.save();
	return property;
};

// Elimina propiedad existente
const deleteProperty = async ({ propertyId }) => {
	
};


module.exports = {
	getProperties,
	addProperty,
	updateProperty,
	deleteProperty,
};