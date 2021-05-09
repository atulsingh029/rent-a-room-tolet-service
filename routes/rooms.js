var express = require("express");
var router  = express.Router();
var Room = require("../models/room");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var { isLoggedIn, checkUserRoom, isSafe } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all rooms
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all rooms from DB
      Room.find({location: regex}, function(err, allRooms){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allRooms);
         }
      });
  } else {
      // Get all rooms from DB
      Room.find({}, function(err, allRooms){
         if(err){
             //console.log(err);
         } else {
            if(req.xhr) {
              res.json(allRooms);
            } else {
              res.render("rooms/index",{rooms: allRooms, page: 'rooms'});
            }
         }
      });
  }
});

//CREATE - add new room to DB
router.post("/", isLoggedIn, isSafe, function(req, res){
  // get data from form and add to rooms array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    //console.log(data);
    //var lat = data.results[0].geometry.location.lat;
    //var lng = data.results[0].geometry.location.lng;
    // var location = data.results[0].formatted_address;
    var newRoom = {name: name, image: image, description: desc, cost: cost, author:author, location: req.body.location, lat: 0, lng: 0};
    // Create a new room and save to DB
    Room.create(newRoom, function(err, newlyCreated){
        if(err){
            
        } else {
            //redirect back to rooms page
            
            res.redirect("/rooms");
        }
    });
  });
});

//NEW - show form to create new room
router.get("/new", isLoggedIn, function(req, res){
   res.render("rooms/new"); 
});

// SHOW - shows more info about one room
router.get("/:id", function(req, res){
    //find the room with provided ID
    Room.findById(req.params.id).populate("comments").exec(function(err, foundRoom){
        if(err || !foundRoom){
            //console.log(err);
            req.flash('error', 'Sorry, that room does not exist!');
            return res.redirect('/rooms');
        }
        //console.log(foundRoom)
        //render show template with that room
        res.render("rooms/show", {room: foundRoom});
    });
});

// EDIT - shows edit form for a room
router.get("/:id/edit", isLoggedIn, checkUserRoom, function(req, res){
  //render edit template with that room
  res.render("rooms/edit", {room: req.room});
});

// PUT - updates room in the database
router.put("/:id", isSafe, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    //var lat = data.results[0].geometry.location.lat;
    //var lng = data.results[0].geometry.location.lng;
    //var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: req.body.location, lat: 0, lng: 0};
    Room.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, room){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/rooms/" + room._id);
        }
    });
  });
});

// DELETE - removes room and its comments from the database
router.delete("/:id", isLoggedIn, checkUserRoom, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.room.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.room.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Room deleted!');
            res.redirect('/rooms');
          });
      }
    })
});

module.exports = router;

