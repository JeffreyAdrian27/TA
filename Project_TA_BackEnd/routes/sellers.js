const { response } = require("express");
const express = require("express");
const base64 = require('base-64');
const axios = require('axios');
const { Op } = require("sequelize");
const User = require("../models/User");
const Item = require("../models/Item");
const Jenis = require("../models/Jenis");
const Offer = require("../models/Offer");
const router = express.Router();
const upload = require('../config/multerConfig');  
const ip = "http://192.168.1.2:3000";
// const ip = "http://10.10.3.236:3000";
// const ip = "http://172.20.10.3:3000";

router.post("/tambahItem", upload.single('gambar'), async (req, res) => {
    let {nama, harga, penjual, deskripsi, jumlah, jenis} = req.body;
    let jenisItem = "";
    try {
        const { originalname, filename } = req.file;
        let jenisItem = await Jenis.findOne({where: {jenis: jenis}});
        if (jenisItem === null) {
            return res.status(403).send({
                'message': "Jenis tidak Ditemukan!"
              });
          } else {
            jenisItem = jenisItem.id_jenis
          } 
        let items = await Item.create({
            nama: nama,
            harga: harga,
            penjual: penjual,
            liked: 0,
            gambar: filename,
            deskripsi: deskripsi,
            jumlah: jumlah,
            status: 1,
            id_jenis: jenisItem, 
        });
        return res.status(201).send({
            "message": nama+" berhasil ditambahkan ke barang"
        });
    } catch (error) { 
        console.error(error);
        return res.status(404).send({
            "message": error.message
        });
    } 
});

router.put("/edit/:username", async (req, res) => {
    const user = req.params.username;
    let {alamat, kota, no_telp} = req.body;
    try {
        let userss = await User.findAll({
            where: {
              username: {
                [Op.eq]: user
              }
            }
          });
          if (userss.length > 0) {
            await User.update(
                {
                    alamat: alamat,
                    kota: kota,
                    no_telp: no_telp,
                },
                {
                    where: {
                        username: {
                        [Op.eq]: user
                        }
                    }
                }
            );
            return res.status(200).send({ "message": user+' berhasil mengubah data' });
          } else {
            return res.status(404).send({ "message": user+' tidak ditemukan' });
          }
    } catch (error) { 
        console.error(error);
        return res.status(404).send({
            "message": error.message
        });
    } 
});

router.get("/products/:penjual", async (req, res) => {
    let penjual = req.params.penjual;
    let arr = [];
    try{
      const items = await Item.findAll({
        where: {
          penjual: {
            [Op.eq]: penjual
          }
        }
      });
      if (items.length >= 1) {
        items.forEach(e => {
          let s = {
            id: e.id,
            nama : e.nama,
            harga : e.harga,
            penjual : e.penjual,
            jumlah : e.jumlah,
            gambar : `${ip}/api/gambar/`+e.gambar,
            jenis : e.jenis,
          }
          arr.push(s);
        });
        
        return res.status(200).send({
          arr
        });
      }else{
        return res.status(404).send({
          'message': 'Barang tidak ditemukkan!'
        }); 
      } 
    } catch (err) {
      return res.status(400).send({ message: err.message });
    }
  }); 

router.put("/products/harga/:id", async (req, res) => {
  let id = req.params.id;
  let harga = req.body.harga;
  let nama = '';
  try{
    const items = await Item.findAll({
      where: {
        id: {
          [Op.eq]: id
        }
      }
    });
    if (items.length >= 1) {
      items.forEach(e => {
        nama = e.nama;
      });
      await Item.update(
        {
          harga: harga
        },
        {
          where: {
            id: {
              [Op.eq]: id
            }
          }
        }
      );
      return res.status(200).send({
        'message': `Harga ${nama} berhasil diubah!`
      });
    }else{
      return res.status(404).send({
        'message': 'Barang tidak ditemukkan!'
      }); 
    } 
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.put("/products/stok/:id", async (req, res) => {
  let id = req.params.id;
  let stok = req.body.jumlah;
  let nama = '';
  try{
    const items = await Item.findAll({
      where: {
        id: {
          [Op.eq]: id
        }
      }
    });
    if (items.length >= 1) {
      items.forEach(e => {
        nama = e.nama;
      });
      await Item.update(
        {
          jumlah: stok
        },
        {
          where: {
            id: {
              [Op.eq]: id
            }
          }
        }
      );
      return res.status(200).send({
        'message': `Stok ${nama} berhasil diubah!`
      });
    }else{
      return res.status(404).send({
        'message': 'Barang tidak ditemukkan!'
      }); 
    } 
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.delete("/products/:id", async (req, res) => {
  let id = req.params.id;
  let nama = '';
  try{
    const items = await Item.findAll({
      where: {
        id: {
          [Op.eq]: id
        }
      }
    });
    if (items.length >= 1) {
      items.forEach(e => {
        nama = e.nama;
      });
      await Item.destroy({
        where: {
            id: id
        }
      });
      return res.status(200).send({
        'message': `${nama} berhasil dihapus!`
      });
    }else{
      return res.status(404).send({
        'message': 'Barang tidak ditemukkan!'
      }); 
    } 
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.get("/product/:id", async (req, res) => {
  let id = req.params.id;
  let arr = [];
    try{
      const items = await Item.findAll({
        where: {
          id: {
            [Op.eq]: id
          }
        }
      });
      if (items.length >= 1) {
        items.forEach(e => {
          let s = {
            nama : e.nama,
            harga : e.harga,
            penjual : e.penjual,
            jumlah : e.jumlah,
            deskripsi : e.deskripsi,
            likes : e.liked,
            gambar : `${ip}/api/gambar/`+e.gambar,
            jenis : e.jenis,
          }
          arr.push(s);
        });
        
        return res.status(200).send({
          arr
        });
      }else{
        return res.status(404).send({
          'message': 'Barang tidak ditemukkan!'
        }); 
      } 
    } catch (err) {
      return res.status(400).send({ message: err.message });
    }
}); 

router.put("/editOffer/:id", async (req, res) => {
  const { id } = req.params;
  const { harga } = req.body; 
  try {
    const item = await Offer.findOne({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: "Barang tidak ditemukan!" });
    }

    await Offer.update({ harga }, { where: { id } });

    return res.status(200).json({ message: "Harga barang berhasil diperbarui!" });
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});

router.put("/editStatus/:id/:decision", async (req, res) => {
  const { id, decision} = req.params;
  const decisionInt = parseInt(decision);
  let status = 0;
  try {
    const item = await Offer.findOne({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: "Barang tidak ditemukan!" });
    }
    if (decisionInt === 1) {
      status = 1;
    } else {
      status = -1;
    }

    await Offer.update({ status }, { where: { id } });

    return res.status(200).json({ message: "Barang berhasil di ubah status!" });
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});



module.exports = router;