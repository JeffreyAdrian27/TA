const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
class Chatting extends Model {}
Chatting.init(
    {
        id: {
            type: DataTypes.INTEGER(255),
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,  
        }, 
        sender: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        receiver: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false, 
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },  
    {
        sequelize,
        timestamps: false, 
        modelName: "Chatting",
        tableName: "chats",
    } 
);
Chatting.sync({ alter: true })   
  
module.exports = Chatting; 