require("dotenv").config();

const SALT_ROUNDS = 6;

const UserTypeEnum = {
  INMOBILIARIA: 'Inmobiliaria',
  USUARIO: 'Usuario',
};

const UserStateEnum = {
  INITIAL: 'Initial',
  CONFIRMED: 'Confirmed',
  DEACTIVATED: 'Deactivated'
};

const PropertyStateEnum = {
  INITIAL_1: 'Initial_1',
  INITIAL_2: 'Initial_2',
  INITIAL_3: 'Initial_3',
  PUBLICADA: 'Publicada',
  DESPUBLICADA: 'Despublicada',
  RESERVADA: "Reservada",
};

const PropertyTypeEnum = {
  HOUSE: 'Casa',
  DEPARTMENT: 'Departamento',
  PH: 'PH',
  PLOT: 'Terreno',
  STOREFRONT: 'Local Comercial'
};

const OrderTypeEnum = {
  ASC: 'ASC',
  DESC: 'DESC'
};

const ReviewTypesEnum = {
  POSITIVE: 'Positiva',
  NEGATIVE: 'Negativa'
};

const ContractTypeEnum = {
  RENT: 'Alquiler',
  SALE: 'Venta',
  SEASON: 'Temporada',
};

const ContactTypeEnum = {
  VISIT: 'Visita',
  QUESTION: 'Pregunta'
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

const ContactStateEnum = {
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  NEW_PROPOSAL: "Nueva_Propuesta",
  DISCARDED: "Descartado"
};

const ContactTimeTypesEnum = {
  AM: "AM",
  PM: "PM"
};

const CurrencyTypeEnum = {
  ARS: "AR$",
  USD: "US$"
};

const ContenidoEnum = ["foto", "video", "audio"];

const DEFAULT_PASSWORD = '1234'

const auth = {
  type: "OAuth2",
  user: "gaxelac@gmail.com",
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  clientId: process.env.GMAIL_API_KEY,
  clientSecret: process.env.GMAIL_API_SECRET,
  refreshToken: process.env.GMAIL_API_REFRESH_TOKEN,
};

const mailOptions = {
  from: "gaxelac@gmail.com",
  to: "gaxelac@gmail.com",
  subject: "Acción en progreso",
  from: "myHome",
};

const OTP_LENGTH = 6;

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;
const PG_ENABLE_SSL = false;

module.exports = {
  PG_CONNECTION_STRING,
  PG_ENABLE_SSL,
  auth,
  mailOptions,
  UserTypeEnum,
  UserStateEnum,
  PropertyStateEnum,
  PropertyTypeEnum,
  OrderTypeEnum,
  ContenidoEnum,
  ContractTypeEnum,
  ContactTypeEnum,
  ContactStateEnum,
  ContactTimeTypesEnum,
  ReviewTypesEnum,
  CurrencyTypeEnum,
  OrientationEnum,
  PositionEnum,
  SALT_ROUNDS,
  defaultProfileGuestImage: "http://res.cloudinary.com/dvjdc3ssy/image/upload/v1668894991/dohnmb6blyd2ei1bjha7.png",
  defaultProfileStudentImage: "https://res.cloudinary.com/dvjdc3ssy/image/upload/v1668894850/rjhj017czkwubzqiw9uu.png",
  OTP_LENGTH,
  getKeyByValue,
  DEFAULT_PASSWORD
};
