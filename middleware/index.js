var Comment = require('../models/comment');
var Room = require('../models/room');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserRoom: function(req, res, next){
    Room.findById(req.params.id, function(err, foundRoom){
      if(err || !foundRoom){
          console.log(err);
          req.flash('error', 'Sorry, that room does not exist!');
          res.redirect('/rooms');
      } else if(foundRoom.author.id.equals(req.user._id) || req.user.isAdmin){
          req.room = foundRoom;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/rooms/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/rooms');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/rooms/' + req.params.id);
       }
    });
  },
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      res.redirect('back');
    }
  },
  isSafe: function(req, res, next) {
    if(req.body.image.match(/^https:\/\/images\.unsplash\.com\/.*/)) {
      next();
    }else {
      req.flash('error', 'Only images from images.unsplash.com allowed.');
      res.redirect('back');
    }
  }
}