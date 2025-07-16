const express=require("express")
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const app=express()
const collection=require('./models/config')
const colns=require('./models/orders')
const path=require("path")
const bcrypt=require("bcrypt")
app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')
const session = require("express-session");
const flash = require("connect-flash");
app.use(express.urlencoded({ extended: true }));
const{isauthenticated,isadmin}=require("./middlewares/auth")


app.use(session({
    secret:"apple",
    resave:false,
    saveUninitialized:true
}))
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});
app.use(flash())
app.use((req,res,next)=>
{
       res.locals.success_msg=req.flash('success_msg')
        res.locals.error_msg=req.flash('error_msg')
        next()
})


dotenv.config()
const port=process.env.PORT
app.get("/",(req,res)=>
{
    res.render("home")
})
app.get("/register",(req,res)=>
{
    res.render("register")
})
app.post("/register",async(req,res,next)=>
{
    const{name,email,password}=req.body
    const existinguser=await collection.findOne({email})
    if(existinguser)
    {
        req.flash('error_msg','user already exists')
        return res.redirect('/register');
    }
    else{
       const rounds=10
       const hashedpassword=await bcrypt.hash(password,rounds)
       const newUser={
        name,
        email,
        password:hashedpassword,
       }
       await collection.create(newUser)
       req.flash('success_msg','Registered Successfully')
       res.redirect('/login')
    }  
})
app.get("/login",(req,res)=>
{
    res.render("login")
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await collection.findOne({ email });

    if (!user) {
        req.flash("error_msg", "User not found");
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        req.flash("error_msg", "Incorrect password");
        return res.redirect("/login");
    }

    req.session.user = user; // ✅ Save to session

    req.flash("success_msg", "Logged in successfully");
    res.redirect("/samples");
});

app.get("/profile", async (req, res) => {
    if (!req.session.user) {
        req.flash("error_msg", "Please log in first");
        return res.redirect("/login");
    }

    try {
        // Fetch all orders for the logged-in user
        const orders = await colns.find({ email: req.session.user.email });

        // Render only once, passing both user and orders
        res.render("profile", {
            user: req.session.user,
            orders: orders
        });

    } catch (err) {
        console.error("Error loading orders:", err);
        req.flash("error_msg", "Something went wrong");
        res.redirect("/samples");
    }
});

app.get("/samples", (req, res) => {
    if (!req.session.user) {
        req.flash("error_msg", "Please log in first");
        return res.redirect("/login");
    }

    res.render("samples"); // samples.ejs must exist
});
app.post("/order",async(req,res)=>
{
    const{item,quantity}=req.body
    try{
        const neworder=new colns({
            email:req.session.user.email,
            item,
            quantity
        })
        await neworder.save()
        req.flash("success_msg","Successfully placed the order")
        res.redirect("/samples")
    }catch(err)
    {
        req.flash("error_msg", "Failed to place order");
        res.redirect("/samples");
    }
})

app.get("/admin-register",(req,res)=>
{
    res.render("admin-register")
})

app.post("/admin-register",async(req,res)=>
{
    const{name,email,password,adminSecret}=req.body
    if(adminSecret!=process.env.ADMIN_SECRET)
    {
        req.flash("error_msg","you are not an admin")
        return res.redirect("/admin-register")
    }
    const existingadmin=await collection.findOne({email})
    if(existingadmin)
    {
        req.flash("error_msg","You are already an admin")
        return res.redirect("/dashboard")
        //res.redirect("/admin-register")
    }
    else{
         const hashedpassword=await bcrypt.hash(password,10)
         await collection.create({
         name,email,
         password:hashedpassword,
         role:"admin"
        })
    req.flash("success_msg","Registered Successfully")
    res.redirect("/dashboard")
    }
})  

app.get('/admin/orders',isauthenticated,isadmin,async(req,res)=>
{
    try{
        const allorders=await colns.find().sort({createdAt:-1})
        res.render('admin-orders',{orders:allorders})
    }catch(err)
    {
        req.flash("error_msg","failed to load orders")
        res.redirect("/dashboard")
    }
})
app.get('/dashboard', isauthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});
app.get("/logout",(req,res)=>
{
    res.render('home')
})
app.listen(port,()=>
{
    console.log("server is running on port:"+port)
})