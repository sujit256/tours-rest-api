const express = require("express");
const tourControllers = require("./../controllers/tourController");
const authControllers = require("./../controllers/authControllers");
const router = express.Router();


router.route('/tourStats').get(tourControllers.getTourStats)

router.route('/getMonthlyPlan').get(tourControllers.getMonthlyPlan)


router
.route("/")
.get( authControllers.protect , tourControllers.getAllTours)
.post(tourControllers.checkBody, tourControllers.createNewTour)



router
  .route("/:id")
  .get(tourControllers.getTour)
  .patch(tourControllers.updateTour)
  .delete(authControllers.protect , authControllers.restrictTo('admin' , 'lead-guide') , tourControllers.deleteTour);

module.exports = router;
