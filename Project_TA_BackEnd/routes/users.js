
const express = require("express");
const bcrypt = require("bcrypt")
const { Op } = require("sequelize");
const nodemailer = require('nodemailer');
const Joi = require('joi');
const jwt = require("jsonwebtoken");
const path = require('path');
const JWT_KEY = 'tugasakhir';
const config = require('../config/config');
const axios = require('axios');
const midtrans  = require('../config/midtransConfig'); 
const User = require("../models/User");
const Item = require("../models/Item");
const Jenis = require("../models/Jenis");
const Kota = require("../models/Kota");
const Bank = require("../models/Bank");
const Liked = require("../models/Liked");
// const Chatting = require("../models/Chatting");
const Offer = require("../models/Offer");
const RekeningUser = require("../models/RekeningUser");
const router = express.Router();
const ip = "http://192.168.1.2:3000";
// const ip = "http://10.10.3.236:3000";
// const ip = "http://172.20.10.3:3000";
 
 
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.email,
    pass: config.password,
  },
});

async function checkUniqueEmail(email) {
    const cekUsers = await User.findAll({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    });
    if (cekUsers.length >= 1) {
      throw new Error("Email sudah terdaftar!");
    }
  }

async function checkUniqueUsername(username) {
    const cekUsers = await User.findAll({
      where: {
        username: {
          [Op.eq]: username
        }
      }
    });
    if (cekUsers.length >= 1) {
      throw new Error("Username sudah ada!");
    }
}
async function cekPass(cpassword, password) {
  if (cpassword !== password) {
      throw new Error("Password dan confirm password tidak sesuai!");
  }
}

router.post("/register", async (req, res) => {
    let { username, email, password, cpassword, role } = req.body;
    let pass = null;
    const schema = Joi.object({
        username: Joi.string().external(checkUniqueUsername).required().messages({
            "any.required": "Username harus diisi!",
            "string.empty": "Username tidak boleh kosong!",
        }),
        email: Joi.string().email().external(checkUniqueEmail).required().messages({
            "any.required": "Email harus diisi!",
            "string.empty": "Email tidak boleh kosong!",
            "string.email": "Email harus valid!",
        }),
        // alamat: Joi.string().required().messages({
        //   "any.required": "Alamat harus diisi!", 
        //   "string.empty": "Alamat tidak boleh kosong!",
        // }),
        // norek: Joi.string().required().messages({
        //   "any.required": "No Rekening harus diisi!",
        //   "string.empty": "No Rekening tidak boleh kosong!",
        // }),
        password: Joi.string().required().messages({
          "any.required": "Password harus diisi!",
          "string.empty": "Password tidak boleh kosong!",
        }),
        cpassword: Joi.string().external(((cpassword, { }) => {
            return cekPass(cpassword, password)
          })).required().messages({
            "any.required": "Confirm password harus diisi!",
            "string.empty": "Confirm password tidak boleh kosong!",
        }),
        role: Joi.string().valid("Penjual", "Pembeli").required().messages({
          "any.required": "Role harus diisi!",
          "string.empty": "Role tidak boleh kosong!",
          "any.only": "Role harus Penjual atau Pembeli",
        }),
      });
    try {
        await schema.validateAsync(req.body);
        const pass = await bcrypt.hash(password, 10);
        token = jwt.sign({
          username: username,
          email: email,
          role: role,
          isVerified: 0
        }, JWT_KEY);
        const mailOptions = {
          from: config.email,
          to: email, 
          subject: 'Email Verification',
          text: "Click the following button to verify your email:", 
          html: `<b>Click the button below to verify your email:</b> <br>
                <a href="https://0k3vf776-3000.asse.devtunnels.ms/api/verify?token=${token}">
                    <button style="background-color:  #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 3px; cursor: pointer;">Verify Email</button>
                </a>`, 
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Failed to send verification email' });
          } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ success: 'Verification email sent' });
          }
        });
        await User.create({
            username: username,
            email: email,
            saldo: 0,
            password: pass,
            role: role,
            norek: 0,
            isVerified: 0
        });
        return res.status(201).send({
            "message": username+" berhasil mendaftarkan akun"
        });
    } catch (error) { 
        console.error(error);
        return res.status(404).send({
            "message": error.message
        });
    } 
});

router.get("/verify", async (req, res) => {
  const token = req.query.token;
  try {
    let userdata = jwt.verify(token, JWT_KEY);
    let username = userdata.username;
    await User.update(
      {
        isVerified: 1
      }, 
      { 
        where: {
          email: {
            [Op.eq]: userdata.email 
          }
        }
      }
    );
   
    const html = `<div style="text-align: center;justify-content: center;align-items: center;">
                    <h1 style="font-size: 45px;">Selamat ${username} telah Berhasil <br> Verifikasi Email</h1>
                    <img style="width: 100%;height: 50%;" src="https://i.pinimg.com/originals/74/2f/7e/742f7ea29cbfd7fd3f4848f17e621070.gif" alt="">
                  </div>';`
    res.send(html);    
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

const formatRupiah = (angka) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  return formatter.format(angka);
};

router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  let {token,pass,verif,email,no_telp,saldo,alamat,kota,no_rek,role} = "";
  let arr = [];
  const schema = Joi.object({
    username: Joi.string().required().messages({
        "any.required": "Username harus diisi!",
        "string.empty": "Username tidak boleh kosong!",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password harus diisi!",
      "string.empty": "Password tidak boleh kosong!",
    }),
  });
  try{
    await schema.validateAsync(req.body);
    const cekUsers = await User.findAll({
      where: {
        username: {
          [Op.eq]: username
        }
      }
    });
    if (cekUsers.length >= 1) {
      cekUsers.forEach(e => {
        pass = e.password;
        verif = e.isVerified;
        email = e.email;
        alamat = e.alamat;
        saldo = formatRupiah(e.saldo);
        no_telp = e.no_telp;
        no_rek = e.norek;
        kota = e.kota;
        role = e.role;
      });
      var hash = bcrypt.compareSync(password, pass); 
      if (!hash) {
        return res.status(403).send({
          'message': "Password salah!"
        });
      }else if(hash && verif==false){
        return res.status(403).send({
          'message': "Anda belum melakukan verifikasi email!"
        });
      }else{
        token = jwt.sign({
          username: username,
          email: email,
          alamat: alamat,
          no_rek: no_rek,
          no_telp: no_telp,
          verif: verif,
          saldo: saldo,
          kota : kota,
          role: role,
        }, JWT_KEY,{expiresIn: '24h'});

        return res.status(200).send({
          "message": username+" berhasil melakukan login!",
          "token":token
        }); 
      } 
    }else{ 
      return res.status(404).send({
        'message': 'Username tidak ditemukkan!'
      });
    }
    
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.get("/tampil", async (req, res) => {
  let arr = [];
  try{
    const items = await Item.findAll();
    if (items.length >= 1) {
      items.forEach(e => {
        let s = {
          id: e.id,
          nama : e.nama,
          harga : e.harga,
          penjual : e.penjual,
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

router.get("/tampilCategory/:jenis", async (req, res) => {
  let arr = [];
  let jenis = req.params.jenis;
  let id = "";
  try{
    const category = await Jenis.findAll({
      where: {
        jenis: {
          [Op.eq]: jenis
        }
      }
    });
    if(category.length > 0){
      category.forEach(e => {
        id = e.id_jenis; 
      }); 
    }
    const items = await Item.findAll({
      where: {
        id_jenis: {
          [Op.eq]: id
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
router.get("/tampilRekening/:username", async (req, res) => {
  let arr = [];
  let cek = "";
  const user = req.params.username;
  try{
    const u = await User.findAll({
      where: {
        username: {
          [Op.eq]: user
        }
      }
    });
    if (u.length >= 1) {
      u.forEach(e => {
        cek = e.norek;
      });
    }
    const rek = await RekeningUser.findAll({
      where: {
        username: {
          [Op.eq]: user
        }
      }
    });
    if (rek.length >= 1) {
      rek.forEach(e => {
        let s = {
          no_rek: e.no_rek,
          bank: e.name,
          cek: cek,
        }
        arr.push(s);
      });
      
      return res.status(200).send({
        arr
      });
    }else{
      return res.status(404).send({
        'message': 'User tidak memiliki nomer rekening!'
      }); 
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

router.get('/gambar/:namaFile', (req, res) => {
  const { namaFile } = req.params;
  res.sendFile(path.join(path.join(__dirname, '..'), 'uploads', namaFile));
});

router.get("/kota", async (req, res) => {
  let arr = [];
  try{
    const kota = await Kota.findAll();
    if (kota.length >= 1) {
      kota.forEach(e => {
        let s = {
          nama: e.name
        }
        arr.push(s);
      });
      return res.status(200).send({ 
        arr
      });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 
router.get("/bank", async (req, res) => {
  let arr = [];
  try{
    const bank = await Bank.findAll();
    if (bank.length >= 1) {
      bank.forEach(e => {
        let s = {
          nama: e.name
        }
        arr.push(s);
      });
      return res.status(200).send({ 
        arr
      });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.get("/jenis", async (req, res) => {
  let arr = [];
  try{
    const jenis = await Jenis.findAll();
    if (jenis.length >= 1) {
      jenis.forEach(e => {
        let s = {
          nama: e.jenis
        }
        arr.push(s);
      });
      return res.status(200).send({ 
        arr
      });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 
router.get("/user/:username", async (req, res) => {
  const user = req.params.username;
  let {no_telp} = "";
  try{
    const users = await User.findAll({
      where: {
        username: {
          [Op.eq]: user
        }
      }
    });
    if (users.length >= 1) {
      users.forEach(e => {
        no_telp = e.no_telp;
      });
      
      return res.status(200).send({ 
        "no_telp": no_telp
      });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.post("/editUser/:username", async (req, res) => {
  const username = req.params.username;
  let {token,pass,verif,email,no_telp,saldo,alamat,kota,no_rek,role} = "";
  try{
    const cekUsers = await User.findAll({
      where: {
        username: {
          [Op.eq]: username
        }
      }
    });
    if (cekUsers.length >= 1) {
      cekUsers.forEach(e => {
        pass = e.password;
        verif = e.isVerified;
        email = e.email;
        alamat = e.alamat;
        saldo = formatRupiah(e.saldo);
        no_telp = e.no_telp;
        no_rek = e.norek;
        kota = e.kota;
        role = e.role;
      });
      
        token = jwt.sign({
          username: username,
          email: email,
          alamat: alamat,
          no_rek: no_rek,
          no_telp: no_telp,
          verif: verif,
          saldo: saldo,
          kota : kota,
          role: role,
        }, JWT_KEY,{expiresIn: '24h'});
        return res.status(200).send({
          "token":token
        }); 
      } 
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.post("/tambahRekening/:username", async (req, res) => {
  let { bank, norek } = req.body;
  const user = req.params.username;
  try{
    const users = await User.findAll({
      where: {
        username: {
          [Op.eq]: user
        }
      }
    });
    if (users.length >= 1) {
      await RekeningUser.create({
        username: user,
        name: bank,
        no_rek: norek,
      });
      await User.update(
        {
          norek: 1
        },
        {
          where: {
            username: {
              [Op.eq]: user
            }
          }
        }
      );
        return res.status(201).send({ 
          "message": user+" berhasil menambahkan nomor rekening!",
        });
    }else{
      return res.status(404).send({ 
        "message": user+" tidak ditemukan!",
      });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

router.get("/searchBarang/:namaItem", async (req, res) => {
  let { namaItem } = req.params;
  let arr = [];
  try{
    const items = await Item.findAll(
      {
        where: {
          nama: {
            [Op.like]: `%${namaItem}%`
          }
        }
      }
    );
    if (items.length >= 1) {
      items.forEach(e => {
        let s = {
          id: e.id,
          nama : e.nama,
          harga : e.harga,
          penjual : e.penjual,
          gambar : `${ip}/api/gambar/`+e.gambar,
          jenis : e.jenis,
        }
        arr.push(s);
      });
    }else{
      return res.status(404).send({ 
        "message": "Barang tidak ditemukan!",
      });
    }
    return res.status(200).send({arr});
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});
// function formatDateTime(inputDateTime) {
//   const date = new Date(inputDateTime);
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   const day = days[date.getDay()];

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const dayOfMonth = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');

//   const formattedDateTime = `${day}, ${year}-${month}-${dayOfMonth} ${hours}:${minutes}`;
//   return formattedDateTime;
// }
// router.get("/inbox/:receiver/", async (req, res) => {
//   let { receiver } = req.params;
//   let arr = [];
//   let s = null;
//   try{
    
//     const chat = await Chatting.findAll(
//       {
//         where: {
//           [Op.or]: [
//             { receiver: receiver },
//             { sender: receiver},
//           ],
//         }
//       }
//     );
//     if (chat.length >= 1) {
//       chat.forEach(e => {
//         if(e.sender == receiver) {
//           s = {
//             id : e.id,
//             sender : e.receiver,
//             message : e.message,
//             time : formatDateTime(e.time),
//           }
//         }else{
//           s = {
//             id : e.id,
//             sender : e.sender,
//             message : e.message,
//             time : formatDateTime(e.time),
//           }
//         }
//         arr.push(s);
//       });
//     }else{
//       return res.status(404).send({ 
//         "message": "Message tidak ditemukan!",
//       });
//     }
//     return res.status(200).send({arr});
//   } catch (err) {
//     return res.status(400).send({ message: err.message });
//   }
// });
// router.get("/chatting/:receiver/:sender", async (req, res) => {
//   let {receiver, sender} = req.params;
//   let arr = [];
//   try{
//     const chat = await Chatting.findAll(
//       {
//         where: {
//           [Op.or]: [
//             { sender: sender, receiver: receiver },
//             { sender: receiver, receiver: sender },
//           ],
//         }
//       }
//     );
//     if (chat.length >= 1) {
//       chat.forEach(e => {
//         let s = {
//           id : e.id,
//           sender : e.sender,
//           message : e.message,
//           time : formatDateTime(e.time),
//         }
//         arr.push(s);
//       });
//     }else{
//       return res.status(404).send({ 
//         "message": "Message tidak ditemukan!",
//       });
//     }
//     return res.status(200).send({arr});
//   } catch (err) {
//     return res.status(400).send({ 'message': err.message });
//   }
// });
// router.post("/sendChatting/:receiver/:sender", async (req, res) => {
//   let {receiver, sender} = req.params;
//   let {message, time} = req.body;
//   let arr = [];
//   try{
//     await Chatting.create({
//       sender: sender,
//       message: message,
//       time: time,
//       receiver: receiver,
//     });
    
//     let s = {
//       sender : sender,
//       message : message,
//       time : formatDateTime(time),
//     }
//     arr.push(s);
      
//     return res.status(200).send({arr});
//   } catch (err) {
//     return res.status(400).send({ 'message': err.message });
//   }
// });

router.get("/cekLike/:user/:id_barang", async (req, res) => {
  let {user, id_barang} = req.params;
  try{
    const like = await Liked.findAll({
      where: {
        [Op.and]: [
          { user: user },
          { id_barang: id_barang }
        ]
      }
    })
    if(like.length >= 1){
      return res.status(200).send({ 
        likes: true,
      });
    }else{
      return res.status(404).send({ 
        likes: false,
      });
    }
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});

router.post("/like/:user", async (req, res) => {
  let {user} = req.params;
  let {id_barang} = req.body;
  let likes = 0;
  try{
    const like = await Item.findAll({
      where: {
        id: {
          [Op.eq]: id_barang
        }
      },
    })

    if(like.length >= 1){
      like.forEach(e => {
        likes = e.liked + 1
      });
      await Item.update({ liked: likes }, {
        where: {
          id: {
            [Op.eq]: id_barang
          }
        },
      });
      await Liked.create({
        user: user,
        id_barang: id_barang,
        like: 1
      });
      return res.status(201).send({ 
        "message": "Berhasil melakukan like!",
      });
    }else{
      return res.status(404).send({ 
        "message": "Barang tidak ditemukan!",
      });
    }
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});

router.delete("/dislike/:user/:id_barang", async (req, res) => {
  let {user, id_barang} = req.params;
  let likes = 0;
  try{
    const like = await Liked.findAll({
      where: {
        [Op.and]: [
          { user: user },
          { id_barang: id_barang }
        ]
      }
    })
    if(like.length >= 1){
      await Liked.destroy({
        where: {
          user: {
            [Op.eq]: user
          }
        },
      });

      const dislike = await Item.findAll({
        where: {
          id: {
            [Op.eq]: id_barang
          }
        },
      })
      if(dislike.length >= 1){
        dislike.forEach(e => {
          likes = e.liked - 1
        });
        await Item.update({ liked: likes }, {
          where: {
            id: {
              [Op.eq]: id_barang
            }
          },
        });
      }
      return res.status(200).send({ 
        "message": "Berhasil melakukan dislike!",
      });
    }else{
      return res.status(404).send({ 
        "message": "Liked tidak ditemukan!",
      });
    }
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});

router.post("/offer/:user", async (req, res) => {
  let {user} = req.params;
  let {id_barang, harga, jumlah, penjual} = req.body;
  try{
    const item = await Item.findAll({
      where: {
        id: {
          [Op.eq]: id_barang
        }
      },
    })

    if(item.length >= 1){
      await Offer.create({
        user: user,
        penjual: penjual,
        id_barang: id_barang,
        harga: harga,
        jumlah: jumlah,
        status: 0
      });
      return res.status(201).send({ 
        "message": "Berhasil melakukan offer!",
      });
    }else{
      return res.status(404).send({ 
        "message": "Barang tidak ditemukan!",
      });
    }
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});

router.get("/tampilOffer/:user/:sender", async (req, res) => {
  let {user, sender} = req.params;
  let role = "";
  let arr = [];
  try{
    const item = await Offer.findAll({
      where: {
        [Op.or]: [
          { user: user, penjual: sender },
          { user: sender, penjual: user }
        ]
      },
      include: [{
        model: Item,
        as: 'item',
      }]
    })
    if(item.length >= 1){
    const users = await User.findAll({
      where: {
        username: user
        }
      })
      if(users.length >= 1){
          role = users[0].role
      }
      if(role == "Penjual"){
        const itemPenjual = await Offer.findAll({
          where: {
            status: 0
          },
          include: [{
            model: Item,
            as: 'item',
          }]
        })
        if (itemPenjual.length >= 1) {
          itemPenjual.forEach(e => {
            const { nama, gambar } = e.item;
            let s = {
              id: e.id,
              nama : nama,
              harga : e.harga,
              jumlah: e.jumlah,
              penjual : e.penjual,
              gambar : `${ip}/api/gambar/`+gambar,
              status: e.status,
            }
            arr.push(s);
          });
        }
      }else{
        if (item.length >= 1) {
          item.forEach(e => {
            const { nama, gambar } = e.item;
            let s = {
              id: e.id,
              nama : nama,
              harga : e.harga,
              jumlah: e.jumlah,
              penjual : e.penjual,
              gambar : `${ip}/api/gambar/`+gambar,
              status: e.status,
            }
            arr.push(s);
          });
        }
      }
      return res.status(200).send({arr});
    }else{
      return res.status(404).send({ 
        "message": "Barang tidak ditemukan!",
      });
    }
  } catch (err) {
    return res.status(400).send({ 'message': err.message });
  }
});

router.get("/tampilBaranglike/:user", async (req, res) => {
  let {user} = req.params;
  let arr = [];
  try{
    const items = await Liked.findAll({
      where: {
        user: user
      },
      include: [{
        model: Item,
        as: 'item',
      }]
    })
    if (items.length >= 1) {
      items.forEach(e => {
        const { nama, harga, penjual, gambar, jenis } = e.item;
        let s = {
          id: e.id,
          nama : nama,
          harga : harga,
          penjual : penjual,
          gambar : `${ip}/api/gambar/`+gambar,
          jenis : jenis,
        }
        arr.push(s);
      });
      
      return res.status(200).send({
        arr
      });
    }else{
      return res.status(404).send({
        'message': 'Belum ada barang yang dilike!'
      }); 
    } 
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}); 

router.post('/create-snap-transaction', async (req, res) => {
  const serverKey = midtrans.serverKey;

  try {
    const { orderId, grossAmount } = req.body;
    
    if (!orderId || !grossAmount || isNaN(grossAmount)) {
      throw new Error('Invalid orderId or grossAmount');
    }

    const midtransUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const midtransOptions = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from( serverKey + ':').toString('base64') // Ganti dengan serverKey Midtrans Anda
      }
    };

    const requestBody = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      credit_card: {
        secure: true
      }
    };

    const response = await axios.post(midtransUrl, requestBody, midtransOptions);

    res.json(response.data);
  } catch (error) {
    console.error('Error creating Snap transaction:', error.message);
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;