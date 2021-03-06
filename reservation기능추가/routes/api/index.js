const express = require('express');
const Tour = require('../../models/tour'); 
const Question = require('../../models/question'); 
const LikeLog = require('../../models/like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/tours', require('./tours'));

// Like for Tour
router.post('/tours/:id/like', catchErrors(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next({status: 404, msg: 'Not exist tour'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, tour: tour._id});
  if (!likeLog) {
    tour.numLikes++;
    await Promise.all([
      tour.save(),
      LikeLog.create({author: req.user._id, tour: tour._id})
    ]);
  }
  return res.json(tour);
}));

// Like for Question
router.post('/answers/:id/like', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  question.numLikes++;
  await question.save();
  return res.json(question);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;
