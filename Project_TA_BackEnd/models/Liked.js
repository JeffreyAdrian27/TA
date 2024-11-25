const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
const Item = require("./Item");
const User = require("./User");
class Liked extends Model {}
Liked.init(
    {
        id: {
            type: DataTypes.INTEGER(255),
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,  
        }, 
        id_barang: {
            type: DataTypes.INTEGER(255),
            allowNull: false,
        },
        like: {
            type: DataTypes.TINYINT(1), 
            allowNull: false,
        },
        user: {
            type: DataTypes.STRING(50), 
            allowNull: false,
        }
    },  
    {
        sequelize,
        timestamps: false, 
        modelName: "Liked",
        tableName: "liked",
    } 
);
Liked.sync({ alter: true })   
  
Liked.belongsTo(Item, {
    foreignKey: "id_barang",
    as: "item", 
});
 
Liked.belongsTo(User, {
    foreignKey: "user",
    as: "likedBy", 
});

module.exports = Liked; 