const { PropertyStateEnum } = require("../../common/constants");

class PropertyState {
    constructor(prop) {

        var property, statusStr, currentState;

        this.getState = function (statusStr) {
            switch (statusStr) {
                case PropertyStateEnum.INITIAL_1:
                    this.currentState = new InitialState1(this);
                    break;
                case PropertyStateEnum.INITIAL_2:
                    this.currentState = new InitialState2(this);
                    break;
                case PropertyStateEnum.INITIAL_3:
                    this.currentState = new InitialState3(this);
                    break;
                case PropertyStateEnum.PUBLICADA:
                    this.currentState = new Publicada(this);
                    break;
                case PropertyStateEnum.DESPUBLICADA:
                    this.currentState = new Despublicada(this);
                    break;
                case PropertyStateEnum.RESERVADA:
                        this.currentState = new Reservada(this);
                        break;
                default:
                    throw Error("error! not valid state ")
            }
        }

        this.property = prop;
        this.statusStr = prop.status;
        this.getState(this.statusStr);

        this.transitionTo = async function (parm) {
            this.property.status = parm;
            this.getState(parm);
            await this.currentState.execute();
        };

        this.execute = async function () {
            return await this.currentState.execute();
        };

        this.validateRequiredFields = async function (statusStr) {

            let result = false;
            switch (statusStr) {
                case PropertyStateEnum.INITIAL_1:
                    // Campos requeridos para progresar a State 2
                    result = this.property.title
                        && this.property.description
                        && this.property.propertyType
                    break;
                case PropertyStateEnum.INITIAL_2:

                
                    let location = await this.property.getLocation();

                    // Campos requeridos para progresar a State 3
                    result = this.property.antiquity
                        && this.property.mtsCovered
                        && this.property.mtsHalfCovered
                        && this.property.mtsUncovered
                        && this.property.numEnvironments
                        && this.property.numRooms
                        && this.property.numBathrooms
                        && this.property.numCars
                        && location;
                    break;
                    // Campos requeridos para progresar a State 4
                case PropertyStateEnum.INITIAL_3:
                    let contractTypes = await this.property.getContract_types();

                    result = this.property.position
                        && this.property.orientation
                        && contractTypes.length >= 1;
                    break;
                default:
                    throw Error(" validateRequiredFields - error! not valid state ")
            }

            return result;
        }

        this.toJSON = function () {
            this.currentState.toJSON();
        };
    }
}

class InitialState1 {
    constructor(state) {
        this.state = state;
        this.statusStr = PropertyStateEnum.INITIAL_1;

        this.execute = async function () {
            if (await this.state.validateRequiredFields(this.statusStr)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Initial_2 state.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_2);
            }
            return this.state;
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}

class InitialState2 {
    constructor(state) {
        this.state = state;
        this.statusStr = PropertyStateEnum.INITIAL_2;

        this.execute = async function () {

            if(!await this.state.validateRequiredFields(PropertyStateEnum.INITIAL_1)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Inital 1.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_1);
            }

            if (await this.state.validateRequiredFields(this.statusStr)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Initial_3 state.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_3);
            }
            return this.state;
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}
class InitialState3 {
    constructor(state) {
        this.state = state;
        this.statusStr = PropertyStateEnum.INITIAL_3;

        this.execute = async function () {

            if(!await this.state.validateRequiredFields(PropertyStateEnum.INITIAL_2)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Inital 2.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_2);
            } else if(!await this.state.validateRequiredFields(PropertyStateEnum.INITIAL_1)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Inital 2.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_1);
            } 

            if (await this.state.validateRequiredFields(this.statusStr)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Publicada state.`);
                await this.state.transitionTo(PropertyStateEnum.PUBLICADA);
            }

            return this.state;
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}

class Publicada {
    constructor(state) {
        this.state = state;
        this.statusStr = PropertyStateEnum.PUBLICADA;

        this.execute = async function () {
            if(!await this.state.validateRequiredFields(PropertyStateEnum.INITIAL_3)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Inital 3.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_3);
            } else if (!await this.state.validateRequiredFields(PropertyStateEnum.INITIAL_2)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Inital 2.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_2);
            }  else if (!await this.state.validateRequiredFields(PropertyStateEnum.INITIAL_1)) {
                console.log(`propertyId(${this.state.property.id}) transicionada a Inital 1.`);
                await this.state.transitionTo(PropertyStateEnum.INITIAL_1);
            } 
            return this.state;
            // TODO! logica para despublicar 
            // console.log("despublicar");
            // await this.state.transitionTo(PropertyStateEnum.DESPUBLICADA);
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}

class Reservada {
    constructor(state) {
        this.state = state;
        this.statusStr = PropertyStateEnum.RESERVADA;

        this.execute = async function () {
            return this.state;
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}

class Despublicada {
    constructor(state) {
        this.statusStr = PropertyStateEnum.DESPUBLICADA;
        this.state = state;

        this.execute = async function () {
            return this.state;
            // console.log("publicar de nuevo");
            // await this.state.transitionTo(PropertyStateEnum.PUBLICADA);
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}

module.exports = {
    PropertyState,
    InitialState1,
    InitialState2,
    InitialState3,
    Publicada,
    Despublicada
}