const { pg_pool } = require('../database')
const MultimediaBuilder = require("../../helpers/builder/MultimediaBuilder.js");

const getMultimediaById = async ({idContenido}) => {
	try {

		let query = ` SELECT * FROM multimedia WHERE idContenido = '${idContenido}' `;
		const records = await pg_pool.query(query);
		if (records.rows.length >= 1) {
			let record = records.rows[0];

			let multimedia = new MultimediaBuilder().buildWithRecord(record);
			return multimedia;
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
};

const addMultimedia = async ({idProperty, tipoContenido, extension, urlContenido}) => {
	try {

		let query = ` INSERT INTO multimedia(idProperty, tipoContenido, extension, urlContenido) VALUES('${idProperty}', '${tipoContenido}', '${extension}',  '${urlContenido}') RETURNING *`;
		const records = await pg_pool.query(query);
		if (records.rows.length >= 1) {
			let record = records.rows[0];

			let multimedia = new MultimediaBuilder().buildWithRecord(record);
			return multimedia;
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
};

const deleteMultimedia = async ({idContenido}) => {
	try {

		let query = ` UPDATE multimedia SET estado = 0 WHERE idContenido = '${idContenido}' `;
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
	getMultimediaById,
	addMultimedia,
	deleteMultimedia
};