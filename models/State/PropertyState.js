const { PropertyStateEnum } = require("../../common/constants");

class PropertyState {
    constructor(prop) {

        var property, statusStr, currentState;

        this.getState = function(statusStr) {
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
                case PropertyStateEnum.INITIAL_4:
                    this.currentState = new InitialState4(this);
                    break;
                case PropertyStateEnum.PUBLICADA:
                    this.currentState = new Publicada(this);
                    break;
                case PropertyStateEnum.DESPUBLICADA:
                    this.currentState = new Despublicada(this);
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
            //let contractType = await Type.findOne({
            //    where: {
            //        propertyId: this.state.property.propertyId,
            //    }
            //});
 
            // Campos requeridos para progresar a State 2
            if(this.state.property.idLocation
                && this.state.property.title
                && this.state.property.description
                && this.state.property.propertyType
                //&& (this.state.property.getTypes().length >=1)
                ) {
                console.log(`propertyId(${this.state.property.propertyId}) transicionada a Initial_2 state.`);
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

            // TODO! completar logica
            if(this.state.property.antiquity
                && this.state.property.mtsCovered
                && this.state.property.mtsHalfCovered
                && this.state.property.mtsUncovered
                && this.state.property.position
                && this.state.property.orientation
                && this.state.property.numEnvironments
                && this.state.property.numRooms
                && this.state.property.numBathrooms
                && this.state.property.numCars
            ) {
                console.log("proceed execute Initial State 2 -> 3");
                await this.state.transitionTo(PropertyStateEnum.INITIAL_3);
            }
            return this.state;


             // TODO! if some field missing, rollback to previous state.
            //console.log("rollback execute Initial State 2 -> 1");
            //await this.state.transitionTo(PropertyStateEnum.INITIAL_1);
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

            // TODO! completar logica
            if(this.state.property.antiquity
                && this.state.property.mtsCovered
                && this.state.property.mtsHalfCovered
                && this.state.property.mtsUncovered
                && this.state.property.numEnvironments
                && this.state.property.numRooms
                && this.state.property.numBathrooms
                && this.state.property.numCars
            ) {
                console.log("proceed execute Initial State 3 -> 4");
                await this.state.transitionTo(PropertyStateEnum.INITIAL_4);
            }

            return this.state;

            // TODO! if some field missing, rollback to previous state.
            //console.log("rollback execute Initial State 2 -> 1");
           // console.log("rollback execute Initial State 3 -> 2");
            //state.transitionTo(PropertyStateEnum.INITIAL_2);
        };

        this.toJSON = function () {
            return this.statusStr;
        };
    }
}

class InitialState4 {
    constructor(state) {
        this.state = state;
        this.statusStr = PropertyStateEnum.INITIAL_4;

        this.execute = async function () {

            // TODO! completar logica
            if(this.state.property.position
                && this.state.property.orientation
                // TODO! imagenes
                // TODO! multimedia (videos)
            ) {
                console.log("proceed execute Initial State 4 -> Publicada");
                await this.state.transitionTo(PropertyStateEnum.PUBLICADA);
            }

            return this.state;

            // // TODO! if some field missing, rollback to previous state.
            //console.log("rollback execute Initial State 2 -> 1");
            //console.log("rollback execute Initial State 4 -> 3");
            //await this.state.transitionTo(PropertyStateEnum.DESPUBLICADA);
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
    InitialState4,
    Publicada,
    Despublicada
}