require("dotenv").config();

const SALT_ROUNDS = 6;

const RoleEnum = ["Usuario", "Inmobiliaria"];

const UserTypeEnum = {
  INMOBILIARIA: 'Inmobiliaria',
  USUARIO: 'Usuario',
};

const UserStateEnum = {
  INITIAL: 'Initial',
  CONFIRMED: 'Confirmed',
};

const PropertyStateEnum = {
  INITIAL_1: 'Initial_1',
  INITIAL_2: 'Initial_2',
  INITIAL_3: 'Initial_3',
  PUBLICADA: 'Publicada',
  DESPUBLICADA: 'Despublicada',
};

const PropertyTypeEnum = {
  HOUSE: 'Casa',
  DEPARTMENT: 'Departamento',
  PH: 'PH',
  PLOT: 'Terreno',
  STOREFRONT: 'Local Comercial'
};

const ContractTypeEnum = {
  RENT: 'Alquiler',
  SALE: 'Venta',
  SEASON: 'Temporada',
};

const OrientationEnum = {
  N: 'N',
  S: 'S',
  E: 'E',
  O: 'O',
  SE: 'SE',
  SO: 'SO',
  NO: 'NO',
  NE: 'NE'
};

const PositionEnum = {
  FRONT: 'Frente',
  REAR: 'Contrafrente',
  INTERNAL: 'Interno',
  SIDE: 'Lateral'
}

const ContractTypeStateEnum = {
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
  RESERVED: "Reserved",
  COMPLETED: "Completed",
  FINALIZED: "Finalized"
};

const CurrencyTypeEnum = {
  ARS: "AR$",
  USD: "US$"
};


const ContenidoEnum = ["foto", "video", "audio"];



const auth = {
  type: "OAuth2",
  user: "gaxelac@gmail.com",
  clientId: process.env.GMAIL_API_KEY,
  clientSecret: process.env.GMAIL_API_SECRET,
  refreshToken: process.env.GMAIL_API_REFRESH_TOKEN,
};

const mailoptions = {
  from: "gaxelac@gmail.com",
  to: "gaxelac@gmail.com",
  subject: "Registro en progreso",
};

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

module.exports = {
  auth,
  mailoptions,
  RoleEnum,
  UserTypeEnum,
  UserStateEnum,
  PropertyStateEnum,
  PropertyTypeEnum,
  ContenidoEnum,
  ContractTypeEnum,
  ContractTypeStateEnum,
  CurrencyTypeEnum,
  OrientationEnum,
  PositionEnum,
  SALT_ROUNDS,
  defaultProfileGuestImage: "http://res.cloudinary.com/dvjdc3ssy/image/upload/v1668894991/dohnmb6blyd2ei1bjha7.png",
  defaultProfileStudentImage: "https://res.cloudinary.com/dvjdc3ssy/image/upload/v1668894850/rjhj017czkwubzqiw9uu.png",
  getKeyByValue
};
