const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
const Item = require("./Item");
const User = require("./User");
class Offer extends Model {}
Offer.init(
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
        harga: {  
            type: DataTypes.INTEGER(10),
            allowNull: false,
        },
        jumlah: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
        }, 
        user: {
            type: DataTypes.STRING(50), 
            allowNull: false,
        },
        penjual: {
            type: DataTypes.STRING(50), 
            allowNull: false,
        },
        status: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
        },
    },  
    {
        sequelize,
        timestamps: false, 
        modelName: "Offer",
        tableName: "offer",
    } 
);
Offer.sync({ alter: true })   
  
Offer.belongsTo(Item, {
    foreignKey: "id_barang",
    as: "item", 
});
 
Offer.belongsTo(User, {
    foreignKey: "user",
    as: "likedBy", 
});

module.exports = Offer; 