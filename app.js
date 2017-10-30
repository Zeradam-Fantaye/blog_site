var express             = require("express"),           //importing express
    app                 = express(),
    bodyParser          = require("body-parser"),       //importing body-parser
    mongoose            = require("mongoose"),          //importing mongoose
    methodOverride      = require("method-override"),   //importing method-override
    expressSanitizer    = require("express-sanitizer"); //importing method-sanitizer


// ============== MONGOOSE/MODEL CONFIG ===============
// Connecting to a database 
mongoose.connect("mongodb://localhost/BlogApp_DB");

// Creating a schema: A plan on what our blog looks like  --
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //Insert current date if not getting any element
});

// We compiled the blogSchema into a model and saved it  --
var Blog = mongoose.model("Blog", blogSchema);


// ============ APP CONFIG ================
//telling express to use bodyparser
app.use(bodyParser.urlencoded({extended: true}));

//For custom style sheet or CSS
app.use(express.static("public"));

//Telling our app to use a method override
app.use(methodOverride("_method"));

//Sanitizers are used to remove Java Script files when the user inputs data
//And it should always come after the body-parser
app.use(expressSanitizer());

//adding the "ejs" extension
app.set("view engine", "ejs");

// Blog.create(
//     {
//         title: "A blog",
//         image: "https://www.theblogstarter.com/wp-content/uploads/2014/02/4.jpg",
//         body: "This is a description area"
//     }, 
    
//     function(err, blog){
//         if(!err){
//             console.log("A new blog is been created");
//         }
//         else{
//             console.log("ERROR: " + err);
//         }
// });


// ============ RESTful Routes ================
//Index
app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    
    Blog.find({}, function(err, blogs){
        if(!err){
            res.render("index", {blogs: blogs})
        }else{
            console.log("ERROR: " + err);
        }   
    });
    
});


//New Route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//Create Route
app.post("/blogs", function(req, res){
    
    // req.body is the one we get from the <form> tag
    // Since we have blog[title], blog[body], ... names in the <form> tag,
    // we can access them like req.body.blog.body, req.body.blog.title, ... 
    
    //SANTIZING USER INPUT BEFORE IT HITS OUR DB
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    //create blog and redirect to the index(which is the /blogs page)
    Blog.create(req.body.blog, function(err, newBlog){
        if(!err){
            res.redirect("/blogs");
        }
        else{
            res.render("new");
        }
    });
});

//Show Route
app.get("/blogs/:id", function(req, res){
    
    Blog.findById(req.params.id, function(err, foundBlog){
        if(!err){
            res.render("show", {blog: foundBlog});
        }else{
            res.redirect("/blogs");
        }
    });
});


//Edit Route
app.get("/blogs/:id/edit", function(req, res){
    
    Blog.findById(req.params.id, function(err, foundBlog){
       
        if(!err){
            res.render("edit", {blog: foundBlog});
            //console.log(foundBlog.body);
        }else{
            res.redirect("/blogs");
        }
        
    });
    
});

//Update Route
app.put("/blogs/:id", function(req, res){
    
    //SANTIZING USER INPUT BEFORE IT HITS OUR DB
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(!err){
            res.redirect("/blogs/" + req.params.id);
        }else{
            res.redirect("/blogs");
        }
    });
});

//Delete Route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(!err){
           res.redirect("/blogs");
       } else{
           res.redirect("/blogs");
       }
    });
});


//------------- LISTENING ROUTE -------------
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING!!");
});