const { getDB } = require("../config/sequelize");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");
class Item extends Model {}
Item.init(
    {
        id: {
            type: DataTypes.INTEGER(255),
            primaryKey: true,
            autoIncrement: true,  
            allowNull: false,
        },  
        nama: { 
            type: DataTypes.STRING(20),
            allowNull: false,  
        },  
        harga: {  
            type: DataTypes.INTEGER(10),
            allowNull: false,
        },
        penjual: { 
            type: DataTypes.STRING(20),
            allowNull: false,
        }, 
        liked: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
        },
        gambar: { 
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        deskripsi: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        jumlah: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
        }, 
        status: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
        },
        id_jenis: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
        },
    },  
    {
        sequelize,
        timestamps: false, 
        modelName: "Item",
        tableName: "items",
    } 
); 


Item.sync({ alter: true })   
  
module.exports = Item; 