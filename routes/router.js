var router = require("express").Router();

var mg= require('mongodb').MongoClient;

var cld= require("cloudinary").v2;
const url='mongodb+srv://lucidia:logmein@lucid.jleku.mongodb.net/snekchar?retryWrites=true&w=majority';



cld.config(
    {
        cloud_name :'snekgal',
        api_key:'576238157374727',
        api_secret: 'H7yRZfZF58l9YuY7VANPEPBlTb4'
        
    }
)

//routes
router.get('/', (rq,rs)=> {rs.render("index")});

router.get('/charlist', async (rq,rs)=>{
    
    var chardatset=[];
    try{
        /* var moncl= new mg(url,{useUnifiedTopology: true})
        await moncl.connect();
        var db = moncl.db('snekchar');
        var coll = db.collection('chars');
        var res = await coll.find();
       
       await res.forEach(doc=>{
           codearr.push(doc.char_code);
       })
       await moncl.close(); */
       var cldres= await cld.api.resources_by_tag('profilepic');

       await cldres.resources.forEach(doc=>{
           chardatset.push({code : doc.public_id, url: doc.url});
       })
       
        
    }
    catch(err){
        console.log(err);
    }
    console.log(chardatset);
    
    rs.render('charlist', {chardatset} );
   
})


//character detail request
router.post('/charprofile', async (rq,rs)=>{
    var code= rq.body.code;
    var gallarray=[]
    
    try{
        var moncl= new mg(url,{useUnifiedTopology: true})
        await moncl.connect();
        var db = moncl.db('snekchar');
        var coll = db.collection('chars');
        var res = await coll.findOne({char_code: code})
        console.log(res);
        await moncl.close();

       var prof = await cld.api.resource(code);
       var profurl = await prof.url;
        var gallery = await (await cld.api.resources_by_tag(code)).resources;
       gallery.forEach(doc=>{
           gallarray.push(doc.url);
       })

        
    }
    catch(err)
    {
        console.log(err);
    }

    console.log(gallarray);
     
    
    rs.render('char_profile', {res,profurl, gallarray});
    
})


//comission sheet

router.get('/comm',async (rq,rs)=>{
    var comm = await cld.api.resource('com_sheet');
    var url=comm.url;
    rs.render('comme',{url})
})




//ADMIN ROUTES
router.get('/admin', (rq,rs)=>{rs.render('admin')})


//character data add route
router.post('/add', async (rq,rs)=>{
    var {ch_code, ch_name , ch_age, ch_gender, ch_height ,ch_weight, backstory}= rq.body;
    if(!ch_code || !ch_name || !ch_age || !ch_gender || !ch_height || !ch_weight || !backstory )
    {
        rs.render('admin', {message: 'fill all feilds and images'})
    }
    else
    {
    var dat = {
        char_code: ch_code,
        char_name: ch_name ,
        char_age: ch_age,
        char_gender: ch_gender,
        char_height: ch_height ,
        char_weight:ch_weight,
        ch_backstory: backstory

    }
    //send text data to mongodb atlas and images to cloudinary
    try{
        var moncl= new mg(url,{useUnifiedTopology: true})
        await moncl.connect();
        var db = moncl.db('snekchar');
        var coll = db.collection('chars');
        var res= await coll.insertOne(dat);
        console.log(res);
        moncl.close();

        await cld.uploader.upload(rq.files.ch_profile.tempFilePath,
            {
                tags: 'profilepic',
                public_id: ch_code
            })
        await cld.uploader.upload(rq.files.ch_stats.tempFilePath,
            {
                tags: 'stats',
                folder: 'stats',
                public_id: ch_code
            })

        rs.render('admin',{message: 'character added!'});
    }

    catch(err) 
    {
        console.log(err);
    }
}

})

//deleting a character
router.post('/remove', async (rq,rs)=>{
    if(!rq.body.ch_code)
    {
        rs.render('admin',{message: 'enter charcter code'})
    }
    else
    {
   try{ 
    var moncl= new mg(url,{useUnifiedTopology: true})
        await moncl.connect();
        var db = moncl.db('snekchar');
        var coll = db.collection('chars');
        var check = await coll.findOne({char_code:rq.body.ch_code})
        if(check==null)
        {
            rs.render('admin', {message: 'character not found'})
        }
        else{
        
        var res= await coll.deleteOne({char_code: rq.body.ch_code});
        
        await moncl.close();

        await cld.api.delete_resources_by_tag(rq.body.ch_code);
        await cld.api.delete_resources(rq.body.ch_code);
        rs.render('admin', {message: 'character removed!'});
        }
        
    }
    catch(err)
    {
        console.log(err);
    }

    }
})



//this was a testing route 
router.post('/gallad',async (rq,rs)=>{
    if(!rq.body.ch_code)
    {
        rs.render('admin', {message: 'fill all feilds and images'})
    }

    else
    {
    try{
        var moncl= new mg(url,{useUnifiedTopology: true})
        await moncl.connect();
        var db = moncl.db('snekchar');
        var coll = db.collection('chars');
        var check = await coll.findOne({char_code:rq.body.ch_code})
        
        if(check==null)
        {
            rs.render('admin', {message: 'character not found'})
        }
        else{
        await cld.uploader.upload(rq.files.gup.tempFilePath, {
            folder: rq.body.ch_code, 
            tags : [rq.body.ch_code]
        });
        rs.render('admin', {message: 'image added to character gallery'});
    }}
    catch(err)
    {
        console.log(err);
    }


   
}
})


module.exports = router;



//5 from course and strong + armstrong number

//test admin api route

router.get('/adminapi', async(rq,rs)=>{
    
    console.log(res);
    rs.send('res');
})