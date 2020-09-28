var router = require("express").Router();

var mg= require('mongodb').MongoClient;

var cld= require("cloudinary").v2;
const url='mongodb+srv://lucidia:logmein@lucid.jleku.mongodb.net/snekchar?retryWrites=true&w=majority';

var moncl= new mg(url,{useUnifiedTopology: true})

cld.config(
    {
        cloud_name :'snekgal',
        api_key:'576238157374727',
        api_secret: 'H7yRZfZF58l9YuY7VANPEPBlTb4'
        
    }
)

//routes
router.get('/', (rq,rs)=> {rs.render("index")});


//admin routes
router.get('/admin', (rq,rs)=>{rs.render('admin')})


//character data add route
router.post('/add', async (rq,rs)=>{
    var {ch_code, ch_name , ch_age, ch_gender, ch_height ,ch_weight}= rq.body;
    console.log(ch_code, ch_name , ch_age, ch_gender, ch_height ,ch_weight);

    var dat = {
        char_code: ch_code,
        char_name: ch_name ,
        char_age: ch_age,
        char_gender: ch_gender,
        char_height: ch_height ,
        char_weight:ch_weight

    }
    //send text data to mongodb atlas
    try{
        await moncl.connect();
        var db = moncl.db('snekchar');
        var coll = db.collection('chars');
        var res= await coll.insertOne(dat);
        console.log(res);
        moncl.close();

        await cld.uploader.upload(rq.files.ch_profile.tempFilePath,
            {
                public_id: ch_code
            })
        await cld.uploader.upload(rq.files.ch_profile.tempFilePath,
            {
                folder: 'stats',
                public_id: ch_code
            })

        rs.send(res);
    }

    catch(err)
    {
        console.log(err);
    }

})



//this was a testing route 
router.post('/upload',async (rq,rs)=>{
    console.log(rq.files.tup);

    try{
        await cld.uploader.upload(rq.files.tup.tempFilePath, {
            folder: 'batista', 
            public_id: 'batista'
            
    });}
    catch(err)
    {
        console.log(err);
    }


    rs.send("file maybe uploaded");
})


module.exports = router;



//5 from course and strong + armstrong number