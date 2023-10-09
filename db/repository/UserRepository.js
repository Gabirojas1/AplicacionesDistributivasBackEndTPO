const User = require('../../models/User.js');
const { db } = require('../database.js');

/**
 * Creates User with the given data
 * @returns account created
 */
const signup = async(firstName, lastName, userType, password, mail, contactMail, fantasyName, phone, cuit) => {
    let user = null; 
    
    await User.create({
        firstName: firstName,
        lastName: lastName, 
        userType: userType,
        password: password, 
        mail: mail,
        contactMail: contactMail, 
        fantasyName: fantasyName,
        phone: phone, 
        cuit: cuit}
    ).then(res => {
        user = res;
    }).catch((error) => {
        console.error('Failed to insert data : ', error);
    });

    return user;
};


/**
 * Lookups for an account in the postgres database with the given account id
 * If not exist returns null
 * @returns account if exists else null
 */
const getUserByIdUsuario = async(uid) => {
    
    let user = null; 

    if (uid == undefined || uid.length < 1) {
        return null
    }

    await User.findOne({
        where: {
            idUsuario: uid
        }
    }).then(res => {
        user = res;
    }).catch((error) => {
        console.error('Failed to retrieve data : ', error);
    });

    return user;
};


/**
 * Lookups for an account in the postgres database with the given mail. 
 * If not exist returns null
 * @returns account if exists else null
 */
const getUserByMail = async(mail) => {
    let user = null; 
    if (mail == undefined || mail.length < 1) {
        return null
    }

    await User.findOne({
        where: {
            mail: mail
        }
    }).then(res => {
        user = res;
    }).catch((error) => {
        console.error('Failed to retrieve data : ', error);
    });

    return user;
};

/**
 * Updates user password if user exists with uid
 * @returns 
 */
const completeUserSignUp = async(uid) => {
    try {

        var query = `UPDATE users SET status = 'Confirmado' WHERE idUsuario = '${uid}' `;
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

        var query = `UPDATE users SET OTP = '${otp}' WHERE idUsuario = '${uid}' `;
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

        var query = `UPDATE users SET OTP = '', password = '${password}' WHERE idUsuario = '${uid}' `;
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
    completeUserSignUp,
    genOTP,
    updatePassword,
};