const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
class Kota extends Model {}
Kota.init(
    {
        id: { 
            type: DataTypes.INTEGER(10),
            primaryKey: true,
            autoIncrement: true,  
            allowNull: false,
        }, 
        name: { 
            type: DataTypes.STRING(50),
            allowNull: false,
        },  
    },
    {
        sequelize,
        timestamps: false, 
        modelName: "Kota",
        tableName: "kota", 
    }
);

    
Kota.sync({ alter: true })  

module.exports = Kota;