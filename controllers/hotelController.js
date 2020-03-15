const Hotel = require('../models/hotel');
const cloudinary = require('cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.diskStorage({});

const upload = multer({storage});

exports.upload = upload.single('image');

exports.pushToCloudinary = (req, res, next) => {
    if(req.file) {
        cloudinary.uploader.upload(req.file.path)
        .then(result => {
            req.body.image = result.image
            console.log(result);           
            next();
        }).catch(() => {
            res.redirect('/admin/add');
        })
    } else {
        next();
    }
}
// exports.homePage = (req, res) => {
//     res.render('index', { title: 'AuNation' });
// }

exports.listAllHotels = async (req, res, next) => {
   try {
    const allHotels = await Hotel.find({ available: {  $eq: true  }  });
    res.render('all_hotels', { title: 'All Hotels', allHotels });
    // res.json(allHotels);
   } catch(error) {
       next(error)
   }

}


exports.homePageFilter = async (req, res, next) => {
    try {
        const hotels = Hotel.aggregate([
            {   $match: { available: true  }  },
            {   $sample: {  size: 5  }  }
        ]);
        const countries = Hotel.aggregate([
            {  $group: { _id: '$country' }  },
            {  $sample: { size: 9  } }
        ]);
        const [filteredCountries, filteredHotels] = await Promise.all([countries, hotels]);
        res.render('index', { filteredCountries, filteredHotels });
        // res.json(hotels);

    } catch(e) {
        next(e)
    }
}


exports.adminPage = (req, res) => {
    res.render('Admin', {  title: 'Admin Page' });
}

exports.createHotelGet = (req, res) => {
    res.render('add_hotel', {  title: 'Add new hotel' });
}

exports.createHotelPost =  async (req, res, next) => {
    // Adding await here makes sure this code pauses till it 
    // the new hotel has been saved before the rest of the code runs
    try {
    const hotel = new Hotel(req.body);    
    await hotel.save();
    console.log(hotel)
    res.redirect(`/all/${hotel._id}`);
  } catch(error) {
      next(error)
  }  
}

exports.listAllCountries = async (req, res, next) => {
    try {
        const allCountries = await Hotel.distinct('country');
        res.render('all_countries', {  title: 'Browse by countries', allCountries })
    } catch(error) {
        next(error)
    }    
}

exports.editRemoveGet = (req, res) => {
    res.render('edit_remove', { title: 'Search for hotel to edit or remove'});
}

exports.editRemovePost = async (req, res, next) => {
    try {
        const hotelId = req.body.hotel_id || null;
        const hotelName = req.body.hotel_name || null;

        const hotelData = await Hotel.find({
            $or: [
                { _id: hotelId  },
                { hotel_name: hotelName  }
            ]
        }).collation({
            locale: 'en', 
            strength: 2
        });

        if(hotelData.length > 0) {
            res.render('hotel_detail', {title: 'Add / Remove  Hotel', hotelData})
            return
        } else {
            res.redirect('/admin');
        }
        
    } catch(e) {
        next(e)
    }
}

exports.updateHotelGet = async (req, res, next) => {
    try {
        // hotelId is used because it was defined as so in the index router file
        const hotel = await Hotel.findOne({ _id: req.params.hotelId });
        res.render('add_hotel', { title: 'Update hotel', hotel  });
    } catch(e) {
        next(e)
    }
}

exports.updateHotelPost = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = await Hotel.findByIdAndUpdate(hotelId, req.body, { new: true });
        res.redirect(`/all/${hotelId}`);
    } catch(e) {
        next(e)
    }
}

exports.deleteHotelGet = async (req, res, next) => {    
    try {
        const hotelId = req.params.hotelId;
        const hotel = await Hotel.findOne({ _id: hotelId });
        res.render('add_hotel', { title: 'Delete Hotel', hotel  });
    } catch (e) {
        next(e)
    }
}

exports.deleteHotelPost = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId
        const hotel = await Hotel.findByIdAndRemove({ _id: hotelId  });
        res.redirect('/admin');
    } catch (error) {
        next(error)
    }
}

exports.hotelDetail = async (req, res, next) => {
    try {
        const hotelParam = req.params.hotel;
        const hotelData = await Hotel.find( {  _id: hotelParam  }  );
        res.render('hotel_detail', { title: 'Lets Travel', hotelData   });
    } catch(e) {
        next(e)
    }
}

exports.hotelsByCountry = async (req, res,next) => {
    try {
        const countryParam = req.params.country;
        const countryList = await Hotel.find({ country: countryParam });
        res.render('hotels_by_country', {  title: `Browse by Country: ${countryParam}`, countryList  });
    } catch (e) {
        next(e)
    }
}