const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Jenis extends Model {}
Jenis.init(
    {
        id_jenis: {
            type: DataTypes.INTEGER(10),
            primaryKey: true,
            autoIncrement: true,  
            allowNull: false,
        },
        jenis: { 
            type: DataTypes.STRING(20),
            allowNull: false,
        }, 
    },  
    {
        sequelize,
        timestamps: false, 
        modelName: "Jenis",
        tableName: "jenis",
    }
);
    
Jenis.sync({ alter: true })  

module.exports = Jenis;