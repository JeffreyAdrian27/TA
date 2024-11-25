const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
class Bank extends Model {}
Bank.init(
    {    
        code: {
            type: DataTypes.STRING(3),
            primaryKey: true,
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
        modelName: "Bank",
        tableName: "banks",
    } 
); 

Bank.sync({ alter: true })   
  
module.exports = Bank; 