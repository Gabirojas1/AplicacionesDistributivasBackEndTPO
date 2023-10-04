const { pg_pool } = require('../database')
const UserBuilder = require("../../helpers/builder/UserBuilder");

/**
 * Creates User with the given data
 * @returns account created
 */
const signup = async(nickname, mail, nombre, hash, tipo_usuario) => {
    try {

        var query = `INSERT INTO usuarios(nickname, mail, nombre, password, tipo_usuario)
		 values ('${nickname}', '${mail}', '${nombre}', '${hash}', '${tipo_usuario}')
		 RETURNING idUsuario, nickname, mail`;
        const records = await pg_pool.query(query);
        if (records.rows.length >= 1) {
            let record = records.rows[0];

            let user = new UserBuilder().buildWithRecord(record);
            return user;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};


/**
 * Lookups for an account in the postgres database with the given account id
 * If not exist returns null
 * @returns account if exists else null
 */
const getUserByIdUsuario = async(uid) => {
    try {

        if (uid == undefined || uid.length < 1) {
            return null
        }

        var query = `SELECT * from usuarios a where a.idUsuario = ${uid} `;
        const records = await pg_pool.query(query);
        if (records.rows.length >= 1) {
            let record = records.rows[0];
            return new UserBuilder().buildWithRecord(record);
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};


/**
 * Lookups for an account in the postgres database with the given mail. 
 * If not exist returns null
 * @returns account if exists else null
 */
const getUserByMail = async(mail) => {
    try {

        if (mail == undefined || mail.length < 1) {
            return null
        }

        var query = `SELECT * from usuarios where mail = '${mail}' `;
        const records = await pg_pool.query(query);
        if (records.rows.length >= 1) {
            let record = records.rows[0];
            return new UserBuilder().buildWithRecord(record);
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

/**
 * Lookups for an account in the postgres database with the given alias. 
 * If not exist returns null
 * @returns account if exists else null
 */
const getUserByNickname = async(nickname) => {
    try {

        if (nickname == undefined || nickname.length < 1) {
            return null
        }

        var query = `SELECT * from usuarios a where a.nickname = '${nickname}' `;
        const records = await pg_pool.query(query);
        if (records.rows.length >= 1) {
            let record = records.rows[0];
            return new UserBuilder().buildWithRecord(record);
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};


/**
 * Updates user password if user exists with uid
 * @returns 
 */
const completeUserSignUp = async(uid) => {
    try {

        var query = `UPDATE usuarios SET habilitado = 'Si' WHERE idUsuario = '${uid}' `;
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

const genOTP = async(uid, otp) => {
    try {

        var query = `UPDATE usuarios SET OTP = '${otp}' WHERE idUsuario = '${uid}' `;
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

const updatePassword = async(uid, password) => {
    try {

        var query = `UPDATE usuarios SET OTP = '', password = '${password}' WHERE idUsuario = '${uid}' `;
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
    signup,
    getUserByIdUsuario,
    getUserByMail,
    getUserByNickname,
    completeUserSignUp,
    genOTP,
    updatePassword,
};