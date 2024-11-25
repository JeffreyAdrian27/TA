const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
const User = require("./User");

class TopUp extends Model {}
TopUp.init(
    {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,  
            allowNull: false,
        },  
        user: {
            type: DataTypes.STRING(50), 
            allowNull: false,
        },
        invoice: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        nominal: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'success', 'failed'),  
            allowNull: false,
            defaultValue: 'pending', 
          },
        mt_payment_link: {
            type: DataTypes.TEXT,     
            allowNull: true,         
        }
    },  
    {
        sequelize,
        timestamps: true, 
        paranoid: true,
        modelName: "TopUp",
        tableName: "top_up",
    }
);

    
TopUp.sync({ alter: true })  

TopUp.belongsTo(User, {
    foreignKey: "user",
    as: "likedBy", 
});

module.exports = TopUp;