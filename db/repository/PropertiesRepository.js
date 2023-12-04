const constants = require('../../common/constants');
const Property = require('../../models/Property');
const { Sequelize, Op } = require('sequelize');
const User = require('../../models/User');
const ContractType = require('../../models/ContractType');
const Location = require('../../models/Location');
const moment = require('moment');

const axios = require('axios');
const Multimedia = require('../../models/Multimedia');
const Favorite = require('../../models/Favorite');
const Contract = require('../../models/Contract');
const Comment = require('../../models/Comment');
const Contacto = require('../../models/Contacto');

const mailHelper = require('../../helpers/mail.js');

/**
* Gets properties by filtering query
* @returns List of properties
*/
const getProperties = async ({ 
    propertyId, ownerUserId, title, description, antiquity, mtsCovered, mtsUnconvered,
    position, orientation, numEnvironments, numRooms, numBathrooms, numCars,
    roofTop, balcony, vault, filterOwned, minRating, orderBy, orderType, skip,
    limit, contractType, propertyType, sum, laundry, swimming_pool, sport_field, 
    solarium, gym, sauna, security, game_room, minPrice, maxPrice, expMinPrice, expMaxPrice,
	currency, country, province, district, lat, long, distanceInMeters, publicada, reservada, despublicada, guardada
}) => {

	let result = [];

	var whereStatement = {};

	if (filterOwned) {

		let statusArray = [constants.PropertyStateEnum.PUBLICADA];
		if (!publicada) {
			statusArray.pop();
		}

		if (reservada) {
			statusArray.push(constants.PropertyStateEnum.RESERVADA);
		}

		if (despublicada) {
			statusArray.push(constants.PropertyStateEnum.DESPUBLICADA);
		}

		if (guardada) {
			statusArray.push(constants.PropertyStateEnum.INITIAL_1);
			statusArray.push(constants.PropertyStateEnum.INITIAL_2);
			statusArray.push(constants.PropertyStateEnum.INITIAL_3);
		}

		whereStatement.status = {
			[Op.in]: statusArray,
		  };
	} else {
		whereStatement.status = "Publicada";
	}
	

	if (ownerUserId)
		whereStatement.ownerUserId = ownerUserId;

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

	let orderStatement = ['updatedAt', 'DESC']
	if (orderBy && orderType) {
		if (orderBy == 'rating') {
			orderStatement = [positiveCount + negativeCount, orderType]
		} else {
			orderStatement = [orderBy, orderType]
		}
	}

	if(propertyType)
		whereStatement.propertyType = propertyType;

	if (antiquity)
		whereStatement.antiquity = antiquity;

	if (mtsCovered)
		whereStatement.mtsCovered = mtsCovered;

	if (mtsUnconvered)
		whereStatement.mtsUnconvered = mtsUnconvered;

	if(position)
		whereStatement.position = position;

	if(orientation)
		whereStatement.orientation = orientation;

	if (numEnvironments !== undefined) {
		whereStatement.numEnvironments = { 
		[Op.gte]: numEnvironments 
		};
	}

	if (numRooms !== undefined) {
		whereStatement.numRooms = { 
		[Op.gte]: numRooms 
		};
	}

	if (numBathrooms !== undefined) {
		whereStatement.numBathrooms = { 
		[Op.gte]: numBathrooms 
		};
	}

	if (numCars !== undefined) {
		whereStatement.numCars = { 
		[Op.gte]: numCars 
		};
	}

	if (roofTop !== undefined)
		whereStatement.roofTop = roofTop;

	if (balcony !== undefined)
		whereStatement.balcony = balcony;

	if (vault !== undefined)
		whereStatement.vault = vault;

	if (sum !== undefined) 
		whereStatement.sum = sum;
	
	if (laundry !== undefined) 
		whereStatement.laundry = laundry;
	
	if (swimming_pool !== undefined) 
		whereStatement.swimming_pool = swimming_pool;
	
	if (sport_field !== undefined) 
		whereStatement.sport_field = sport_field;
	
	if (solarium !== undefined) 
		whereStatement.solarium = solarium;
	
	if (gym !== undefined) 
		whereStatement.gym = gym;
	
	if (sauna !== undefined) 
		whereStatement.sauna = sauna;
	
	if (security !== undefined) 
		whereStatement.security = security;
	
	if (game_room !== undefined) 
		whereStatement.game_room = game_room;

	let contractTypeWhereClause = {};
	if (contractType) {
		contractTypeWhereClause.contractType = contractType;
	}

	if (minPrice !== undefined) {
		contractTypeWhereClause.price = { [Op.gte]: minPrice };
	}

	if (maxPrice !== undefined) {
		if (contractTypeWhereClause.price) {
			contractTypeWhereClause.price[Op.lte] = maxPrice;
		} else {
			contractTypeWhereClause.price = { [Op.lte]: maxPrice };
		}
	}

	if (expMinPrice !== undefined) {
		contractTypeWhereClause.expPrice = { [Op.gte]: expMinPrice };
	}

	if (expMaxPrice !== undefined) {
		if (contractTypeWhereClause.expPrice) {
			contractTypeWhereClause.expPrice[Op.lte] = expMaxPrice;
		} else {
			contractTypeWhereClause.expPrice = { [Op.lte]: expMaxPrice };
		}
	}

	if (currency) {
		contractTypeWhereClause.currency = currency;
	}

	let inmobiliariaWhereClause = {};
	if (minRating) {
		inmobiliariaWhereClause.rating = {
			[Op.gte]: minRating
		};
	}
	
	
	let locationWhereClause = {};
	if (country) {
		locationWhereClause.country = country
	}

	if (province) {
		locationWhereClause.province = province;
	}

	if (district) {
		locationWhereClause.district = district;
	}

	if (lat && long) { 
		locationWhereClause = Sequelize.where(Sequelize.fn('ST_DistanceSphere', Sequelize.literal('geom'), Sequelize.literal('ST_MakePoint(' + lat + ',' + long + ')')), {[Op.lte]: distanceInMeters ? distanceInMeters : 1000})
	}

	var findStatement = {
		where: whereStatement,
		order: [orderStatement],
		offset: skip,
		limit: limit,
		include: [{
			model: User,
			required: true,
			where: Object.keys(inmobiliariaWhereClause).length ? inmobiliariaWhereClause : undefined,
			include: [{
				model: Comment,
				required: false,
			}]
		},
		{
			model: ContractType,
			where: Object.keys(contractTypeWhereClause).length ? contractTypeWhereClause : undefined,
			required: Object.keys(contractTypeWhereClause).length ? true : false,
			include: [{
				model: Contract
			}]
		},
		{
			model: Contacto,
			required: false
		}, {
			model: Location,
			where: Object.keys(locationWhereClause).length ? locationWhereClause : undefined,
			required: Object.keys(locationWhereClause).length ? true : false
		}, {
			model: Multimedia
		},
		]
	}

	// if (filterOwned) {
	// 	findStatement.include = 'user';
	// }

	let totalRecords = await Property.count({ where: whereStatement });

	await Property.findAll(findStatement).then(res => {
		if (!res.length) {
			const error = new Error("Ningún resultado encontrado para los filtros indicados");
			error.msg = "Ningún resultado encontrado para los filtros indicados";
			error.status = 404;
			throw error;
		} else {
			result =  {
				"code": "200",
				"timestamp": moment().unix(),
				"page": Math.floor(skip / limit) + 1,
				"total": res.length,
				"cantTotal": totalRecords,
				"cantPage": Math.ceil(totalRecords/limit),
				"data": res
			};
		}
	}).catch((error) => {
		error.status = error.status ? error.status : 500;
        throw error;
	})

	return result
};

/**
 * Busca propiedad por id
 * si no existe retorna null
 * @returns property if exists else null
 */
const getPropertyById = async(propertyId) => {
    
    let property = null; 

    if (propertyId == undefined || propertyId.length < 1) {
        return null;
    }

    await Property.findOne({
        where: {
            id: propertyId
        },
		include: [{
			model: User,
			required: true
		}]
    }).then(res => {
        property = res;
    }).catch((error) => {
        error.status = 500;
        console.error('Failed to retrieve data : ', error);
    });

    return property;
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
	clone.ownerUserId = body.id;
	delete clone.id;

	await Property.create(clone,
		{
			include: [ContractType],
		})
		.then(async res => {
			result = res;

			// Location
			if (body.location) {

				// reset location object from body
				let cloneLoc = JSON.parse(JSON.stringify(body.location))

				// Google Maps call
				// Si el front ya geocodifico debe informar estos datos
				if (!cloneLoc.latitude || !cloneLoc.longitude || !cloneLoc.location_id) {

					delete cloneLoc.location_id;
					delete cloneLoc.latitude;
					delete cloneLoc.longitude;

					let response = await geocodeAddress(cloneLoc.street, cloneLoc.streetNumber,
						cloneLoc.district, cloneLoc.province, cloneLoc.country);

					if (response && response.statusText == "OK") {
						cloneLoc.location_id = response.data.results[0].place_id;
						cloneLoc.latitude = response.data.results[0].geometry.location.lat;
						cloneLoc.longitude = response.data.results[0].geometry.location.lng;
						
					}
				}

				cloneLoc.id = cloneLoc.location_id;
				delete cloneLoc.location_id;
				
				cloneLoc.geom = Sequelize.fn('ST_MakePoint', cloneLoc.latitude, cloneLoc.longitude);

				aux = await Location.findOrCreate({
					where: { id: cloneLoc.id },
					defaults: cloneLoc
				});

				result.locationId = aux[0].id;
				result.location = aux[0];
				result.setLocation(aux[0]);

			}

			// Multimedia / Photos
			if (body.photos) {
				await body.photos.forEach(async photo => {
					let mlt = await Multimedia.create({propertyId: res.id, url: photo.url})
					await res.addMultimedia(mlt);
				});
			}
		})
		.catch((error) => {
			error.status = 500;
			error.message = error;
			throw error;
		});

	await result.save();
	await result.reload({include: [{all: true, nested: true}]});
	return result;
};

// actualiza propiedad existente
const updateProperty = async (property, body) => {

	// Actualizarla con la info del body.
	// Exceptuando campos no editables
	var clone = JSON.parse(JSON.stringify(body));
	delete clone.id;
	delete clone.rating;
	delete clone.contract_types;
	delete clone.location;
	delete clone.photos;

	await property.update(clone);

	// Location
	if (body.location) {

		// reset location object from body
		let cloneLoc = JSON.parse(JSON.stringify(body.location))

		// Google Maps call
		// Si el front ya geocodifico debe informar estos datos
		if (!cloneLoc.latitude || !cloneLoc.longitude || !cloneLoc.location_id) {

			delete cloneLoc.location_id;			
			delete cloneLoc.latitude;
			delete cloneLoc.longitude;

			let response = await geocodeAddress(cloneLoc.street, cloneLoc.streetNumber,
				cloneLoc.district, cloneLoc.province, cloneLoc.country);

			if (response && response.statusText == "OK") {
				cloneLoc.location_id = response.data.results[0].place_id;
				cloneLoc.latitude = response.data.results[0].geometry.location.lat;
				cloneLoc.longitude = response.data.results[0].geometry.location.lng;
			}
		}

		cloneLoc.id = cloneLoc.location_id;
		delete cloneLoc.location_id;

		cloneLoc.geom = Sequelize.fn('ST_MakePoint', cloneLoc.latitude, cloneLoc.longitude);

		aux = await Location.findOrCreate({
			where: { id: cloneLoc.id },
			defaults: cloneLoc
		});

		property.locationId = aux[0].id;
		property.location = aux[0];
		property.setLocation(aux[0]);

		
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

	// Multimedia / Photos
	if (body.photos && body.photos.length >= 1) {

		// reemplazo total de imagenes
		await Multimedia.destroy({
			where: {
			  propertyId: property.id
			},
		  });

		let multiArray = [];
		await body.photos.forEach(photo => {
			Multimedia.create({ propertyId: property.id, url: photo.url })
				.then(res => {
					multiArray.push(res);
				})
				.catch((error) => {
					error.status = 500;
					error.message = error;
					throw error;
				});
		});
		await property.addMultimedia(multiArray);
	}
	await property.save();
	await property.reload({include: [{all: true, nested: true}]});
	return property;
};

// Elimina logicamente una propiedad existente
const deleteProperty = async (property) => {
	// TODO! eliminar favoritos logicamente

	let alreadySentMail = [];

	let favorites = await Favorite.findAll({
		where: {
			propertyId: property.id
		},
		include: [{
				model: User,
				required: true
			}
		]
	})
	favorites.forEach(async fav => {

		if (!alreadySentMail.includes(fav.user.mail)) {

			let text = `Hola! Te escribimos de myHome! \n
			Te informamos que un favorito que tenías guardado fue eliminado debido a que la propiedad fue despublicada. `;
			mailHelper.sendMail(fav.user.mail, text);
			
			alreadySentMail.push(fav.user.mail);
		}

		fav.destroy();
	});

	// TODO! eliminar contactos logicamente
	let contactos = await Contacto.findAll({
		where: { 
			propertyId: property.id 
		},
		include: [{
			model: User,
			required: true,
		}]
	})
	contactos.forEach( async ct => {

		if (!alreadySentMail.includes(ct.user.mail)) {
			let text = `Hola! Te escribimos de myHome! \n
			Te informamos que un favorito que tenías guardado fue eliminado debido a que la propiedad fue despublicada. `;
			mailHelper.sendMail(ct.user.mail, text);

			alreadySentMail.push(ct.user.mail)
		}


		ct.destroy();
	});

	property.status = constants.PropertyStateEnum.DESPUBLICADA;
	property.save();
	property.reload({include: [{all: true, nested: true}]});
};

/**
 * 
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distanceInMeters 
 * @returns 
 */
const getNearbyCondition = (lat, long, distanceInMeters) => {
	const point = `ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)::geography`;
    return Sequelize.literal(`ST_DWithin(geom::geography, ${point}, ${distanceInMeters})`);
};

/**
 * Meotod de geocodificación la direccion en latitude y longitude utilizando google maps api
 * @param {*} street_name Av Siempreviva 
 * @param {*} street_number 12345
 * @param {*} district Lomas de Zamora 
 * @param {*} state Buenos Aires
 * @param {*} country Argentina 
 * @returns latitude y longitude
 */
const geocodeAddress = async (street_name, street_number, district, state, country) => {

	let response = null;
	let address = encodeURIComponent(street_name + " "
		+ street_number + ", "
		+ district + ", "
		+ state + ", "
		+ country)

	// https://maps.googleapis.com/maps/api/geocode/json?address=Av+Siempre+Viva+1234,+Temperley,+Buenos+Aires&key=AIzaSyAnw2SpDqRg3YTMsbkzIgfbFeEEH6VMoF8
	await axios.get('https://maps.googleapis.com/maps/api/geocode/json'
		+ '?address=' + address
		+ '&key=' + process.env.GMAPS_API_KEY)
		.then(res => {
			response = res;
		})
		.catch(error => {
			error.message = "Error al realizar geocodificación de dirección: " + error;
			error.status = 500;
			throw error;
		});

	return response;
};


module.exports = {
	getProperties,
	getPropertyById,
	addProperty,
	updateProperty,
	deleteProperty,
};