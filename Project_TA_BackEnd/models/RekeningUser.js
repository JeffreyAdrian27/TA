const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes, INTEGER } = require("sequelize");
class RekeningUser extends Model {}
RekeningUser.init(
    {    
        id: {
            type: DataTypes.INTEGER(255),
            primaryKey: true,
            autoIncrement: true,  
            allowNull: false,
        }, 
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        no_rek: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    },  
    {
        sequelize,
        timestamps: false, 
        modelName: "RekeningUser",
        tableName: "rekening_user",
    } 
); 

RekeningUser.sync({ alter: true })   
  
module.exports = RekeningUser; 