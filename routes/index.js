const express = require('express');
const router = express.Router();

// requireControllers

const hotelController = require('../controllers/hotelController')

/* GET home page. */
router.get('/', hotelController.homePageFilter);

router.get('/all', hotelController.listAllHotels);
router.get('/countries', hotelController.listAllCountries);
router.get('/all/:hotel', hotelController.hotelDetail);
router.get('/countries/:country', hotelController.hotelsByCountry);



// ADMIN ROUTES

router.get('/admin', hotelController.adminPage);
router.get('/admin/add', hotelController.createHotelGet);
router.post('/admin/add', 
    hotelController.upload,
    hotelController.pushToCloudinary,
    hotelController.createHotelPost);
router.get('/admin/edit-remove', hotelController.editRemoveGet);
router.post('/admin/edit-remove', hotelController.editRemovePost);
router.get('/admin/:hotelId/update', hotelController.updateHotelGet);
router.post('/admin/:hotelId/update', 
    hotelController.upload,
    hotelController.pushToCloudinary,
    hotelController.updateHotelPost);
router.get('/admin/:hotelId/delete', hotelController.deleteHotelGet);
router.post('/admin/:hotelId/delete', hotelController.deleteHotelPost);



module.exports = router;

