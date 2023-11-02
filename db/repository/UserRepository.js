const User = require('../../models/User.js');

/**
 * Creates User with the given data
 * @returns account created
 */
const signup = async(firstName, lastName, userType, password, mail, contactMail, fantasyName, phone, cuit, photo) => {
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
        cuit: cuit,
        photo: photo
    }).then(res => {
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
            id: uid
        }
    }).then(res => {
        user = res;
    }).catch((error) => {
        console.error('Failed to retrieve data : ', error);
    });

    return user;
};


/**
 * Busca usuario por mail
 * @returns user si existe, sino null
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
 * Busca usuario por mail
 * Devuelve el modelo user, incluyendo el campo password para comparacion de hashes
 * @returns user si existe, sino null
 */
const getUserByMailIncludePasswordField = async(mail) => {
    let user = null; 
    if (mail == undefined || mail.length < 1) {
        return null
    }

    await User.scope('withPassword').findOne({
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
const confirmSignup = async(uid) => {
    let user = null; 
    if (uid == undefined || uid < 0) {
        return user;
    }

    await User.findOne({
        where: {
            id: uid
        }
    }).then(async res => {
        res.status = "Confirmado";
        await res.save();
        user = res;
    }).catch((error) => {
        console.error('Failed to update data : ', error);
    });

    return user;
};

// actualiza usuario existente
const updateUser = async (user, body) => {

	// Reemplazar el user con la info del body
	// Exceptuando campos no editables
	var clone = JSON.parse(JSON.stringify(body));
	delete clone.id;
    delete clone.userId;
    delete clone.userType;
    delete clone.repeatPassword;
    delete clone.status;
    delete clone.createdAt;
    delete clone.updatedAt;

    // TODO! agregar associations 
	await user.update(clone);
	await user.save();
    await user.reload();
	return user;
};


const genOTP = async(user, otp) => {
    user.otp = otp;
    user.save();
    user.reload();
};

const updatePassword = async(uid, password) => {
    try {

        var query = `UPDATE users SET OTP = '', password = '${password}' WHERE id = '${uid}' `;
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
    getUserByMailIncludePasswordField,
    confirmSignup,
    updateUser,
    genOTP,
    updatePassword,
};