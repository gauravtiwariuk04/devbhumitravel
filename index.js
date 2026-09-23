const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const db = require('./config/db'); 
const session= require('express-session');
// Express app
const app = express();
// View engine
app.set('view engine', 'ejs');
// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'Usesession',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 30,
        secure: false,
        httpOnly: true
    }
}));
// Uploads folder ko public access dena
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const upload = multer({
     storage: multer.diskStorage({
        destination: "uploads/",
      filename: (req, file, cb) =>
     cb(null, Date.now() + path.extname(file.originalname))
   })
});
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/Registeruser', upload.single('profile_image'), async (req, res) => { 
  const username= req.body.username; 
     const email= req.body.email; 
        const address= req.body.address; 
          const phone= req.body.phone; 
            const gender= req.body.gender; 
              const state= req.body.state; 
               const password= req.body.password;
           const profile_image = req.file ? req.file.filename : null; 
          const hashedPassword = await bcrypt.hash(password, 8); 
        const usertype= req.body.usertype; 
      const sql = `INSERT INTO users (username, email, address, phone, gender, state, profile_image, password,usertype) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`; 
    const values = [username, email, address, phone, gender, state, profile_image, hashedPassword,usertype]; 
   const [result] = await db.query(sql, values); 
  res.send(`<script>alert("User successfully registered!");window.location.href = "/userdataget";</script>`); 
});   

app.get('/userdataget', async (req, res) => {
    const sql = 'SELECT * FROM users';
        const [result] = await db.query(sql);
        res.render('Dataviewall', {usersList: result});
});

   app.get('/edit/:id',(req,res)=>{
      const id= req.params.id;
        const sql= 'SELECT * FROM  users WHERE id=?';
          db.query(sql,[id],(error,result)=>{
            if(error){
            res.resend('error');
          }else{
        res.render('Dataupdate', { usersList: result }); 
      }
    })    
  })
  app.post('/Registeruserdataupdate', (req, res) => {
    const id = req.body.id;
      const username = req.body.username;
        const email = req.body.email;
          const address = req.body.address;
            const phone = req.body.phone;
          const sql=`UPDATE users set username=?,email=?,address=?,phone=? WHERE id= ?`;
        const values=[username,email,address,phone,id];
      db.query(sql,values,(error,result)=>{
    if(error){
       res.send('error');
         }else{
          res.send(' Data Update ssucess sucess' + id + username + email + phone + address);
        }
      });  
   });
  app.get('/Delete/:id', (req, res) => {
       const id = req.params.id;
         const sql = 'DELETE FROM users WHERE id = ?';
          db.query(sql, [id], (error, result) => {
           if (error) {
            console.log(error);
           return res.send('Database Error');
         }
        res.redirect('/userdataget');
    });
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.post("/userlogin", async (req, res) => {
    const { email, password } = req.body;
         const [userdata] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            const user = userdata[0];
               const ismatch = await bcrypt.compare(password, user.password);
                  req.session.userId = user.id;
                     req.session.email = user.email;
                    req.session.usertype = user.usertype;
                  if (user.usertype === "admin") {
                res.render("dashboard", { user: { id: req.session.userId, email: req.session.email,usertype: req.session.usertype
              } });
            } else if (user.usertype === "user") {
           res.render("dashboard", {  user: {id: req.session.userId,email: req.session.email,usertype: req.session.usertype
         }});
       } else {
      res.send("Logged in successfully, but user type is unknown.");
    } 
  });

app.listen(5000, () => {
    console.log('Server running at http://localhost:5000');
});


