const express = require("express");
const router  = express.Router({mergeParams: true});
const Room = require("../models/room");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { text } = require("body-parser");
const { isLoggedIn, checkUserComment, isAdmin } = middleware;

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find room by id
    //console.log(req.params.id);
    Room.findById(req.params.id, function(err, room){
        if(err){
            //console.log(err);
        } else {
             res.render("comments/new", {room: room});
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, function(req, res){
   //lookup room using ID
   Room.findById(req.params.id, function(err, room){
       if(err){
           res.redirect("/rooms");
       } else {
         let com = new Comment({text:req.body.comment.text});
         com.author.id = req.user._id;
         com.author.username = req.user.username;
         com.save();
         room.comments.push(com);
         room.save();
         req.flash('success', 'Created a comment!');
         res.redirect('/rooms/' + room._id);
       }
   });
});

router.get("/:commentId/edit", isLoggedIn, checkUserComment, function(req, res){
  res.render("comments/edit", {room_id: req.params.id, comment: req.comment});
});

router.put("/:commentId", isLoggedIn, function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          //console.log(err);
           res.render("edit");
       } else {
           res.redirect("/rooms/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId", isLoggedIn, checkUserComment, function(req, res){
  // find room, remove comment from comments array, delete comment in db
  Room.findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, function(err) {
    if(err){ 
        //console.log(err)
        req.flash('error', err.message);
        res.redirect('/');
    } else {
        req.comment.remove(function(err) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('error', 'Comment deleted!');
          res.redirect("/rooms/" + req.params.id);
        });
    }
  });
});

module.exports = router;