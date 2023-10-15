const constants = require('../../common/constants');
const Property = require('../../models/Property');
const { Op, where } = require('sequelize');
const User = require('../../models/User');
const ContractType = require('../../models/ContractType');
const Location = require('../../models/Location');

/**
* Gets properties by filtering query
* @returns List of properties
*/
const getProperties = async ({ propertyId, userId, title, description,
	antiquity, mtsCovered, mtsUnconvered, position, orientation, numEnvironments,
	numRooms, numBathrooms, numCars, roofTop, balcony, vault, filterOwned,
	minRating, orderBy, orderType, skip, limit }) => {

	let result = [];

	var whereStatement = {};

	if (userId)
		whereStatement.userId = userId;

	if (propertyId)
		whereStatement.id = propertyId;

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
		limit: limit,
		include: [ContractType, Location]
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

	// TODO! usar servicio de google para generar latitud y longitud de location
	await Property.create(clone,
		{
			include: [ContractType, Location],
		})
		.then(res => {
			result = res;
		})
		.catch((error) => {
			console.error('Failed to retrieve data : ', error);
		});

	result.save();
	return result;
};

// actualiza propiedad existente
const updateProperty = async (property, body) => {

	// Actualizarla con la info del body.
    // Exceptuando campos no editables
    var clone = JSON.parse(JSON.stringify(body));
    delete clone.propertyId;
    delete clone.rating;
    delete clone.status;
    delete clone.contract_types;
    delete clone.location

	await property.update(clone);

	// agregar associations 

	// Location
	// TODO! servicio para obtener latitud y longitud en base a la info de location
	if (body.location) {
		let location = await Location.findOrCreate({
			where: body.location,
			defaults: body.location
		});
	
		property.locationId = location[0].id;
		property.location = location[0];
		property.setLocation(location[0]);
	}

	// Tipos de Contrato
	// por cada contract type que se quiere agregar
	if (body.contract_types) {
		await body.contract_types.forEach(async ctype => {

			ctype.propertyId = property.id;
	
			// eliminamos campos editables para la busqueda
			var whereStmt = JSON.parse(JSON.stringify(ctype));
			whereStmt.propertyId = property.id;
			delete whereStmt.price;
			delete whereStmt.expPrice;
			delete whereStmt.currency;
			delete whereStmt.contractDays;
	
			// TODO! validar fields
			// ejemplo Rent deberia tener contractDays
			let res = await ContractType.findOrCreate({
				where: whereStmt,
				defaults: ctype
			});
	
			let newCtype = res[0];
			let created = res[1];
	
			// Si no existia, lo agregamos a la property
			if (created) {
				await property.addContract_type(newCtype);
			}
			// Si ya existia, actualizamos sus campos
			else {	
				newCtype.price = ctype.price;
				newCtype.expPrice = ctype.expPrice;
				newCtype.currency = ctype.currency;
				newCtype.contractDays = ctype.contractDays;
				await newCtype.save();
			}
		});
	}
	
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