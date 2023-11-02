var cloudinary = require("cloudinary").v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_USER, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET, 
});

const imgOptions = {
    format: 'png',
    width: 200,
    height: 200,
    tags: ["myhome", "uade", "distribuidas", "app"]
};

// Sube imagen a cloudinary y devuelve URL publica
const uploadImage = async photo => {
    let url = "";
    await cloudinary.uploader.upload(photo, imgOptions)
    .then((image) => {
       url = image.url;
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).jsonExtra({
            ok: false,
            message: "Error inesperado al subir imagen a cloudinary.",
            error: err
        });
    });
    return url;
}
const cloudinaryImageUploadMethod = async file => {
    return new Promise(resolve => {
        cloudinary.uploader.upload( file , (err, res) => {
          if (err) return res.status(500).send("upload image error")
            resolve({ 
              url: res.secure_url
            }) 
          }
        ) 
    })
  }

module.exports = {
    uploadImage,
    cloudinaryImageUploadMethod
};
