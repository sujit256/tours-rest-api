const express = require("express");
const Tour = require("../models/tourModels");

const catchAsync  = require('./../utils/catchAsync');
const appError = require("../utils/appError");

exports.checkBody = catchAsync((req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "name and price missing",
    });
  }
  next();
});

exports.getAllTours = catchAsync( async ( req  , res , next) => {
   

      const tours = await Tour.find()

      if(!tours){
       return  next(new appError('cannot find tours' , 404))
      }

      res.status(200).json({
        status: 'success',
        length: tours.length,
        data: { tours },
      });
   
  });
  
//get product by id


exports.getTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;

  

    // If the ID is valid, proceed with finding the tour
    const tour = await Tour.findById(id);

    // If no tour is found, return a 404 error
    if (!tour) {
        return next(new appError(`Cannot find tour with ID: ${id}`, 404));  // Not Found
    }

    // Return the tour if found
    res.status(200).json({
        status: "success",
        data: {
            tour,
        },
    });
});




exports.createNewTour = catchAsync( async (req, res , next) => {

    const newTour = await Tour.create(req.body);

  

    res.status(200).json({
      status: "success",
      data: {
        tour: {
           newTour 
          },
      },
    });

});

exports.updateTour = catchAsync( async (req, res , next) => {
 
    const { id } = req.params;
    const { name, difficulty } = req.body;

    console.log(name, difficulty);

    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      {
        name,
        difficulty,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        tour: updatedTour,
      },
    });

});

exports.deleteTour = catchAsync( async (req, res , next) => {
  
    const { id } = req.params;

    await Tour.findByIdAndDelete(id);

    res.status(204).json({
      message: "tour deleted successfully",
    });

});


exports.getTourStats = catchAsync( async (req , res , next) => {
    

       const stats  = await Tour.aggregate([
        {
          $match : {ratingsAverage : {$gte : 4.5}}
        },
        {
          $group:{
            _id : "$difficulty" ,
            numRating:{$sum : "$ratingsQuantity"},
            avgRating:{$avg:"$ratingsAverage"},
            avgPrice:{$avg :"$price"},
            maxPrice :{$max : "$price"}
          }
        },
        {
          $sort:{avgPrice : -1}
        },
        {
          $match:{_id : {$ne : "easy"}}
        }


       ])
           

        res.status(200).json({
          status:"success",
          result:stats.length,
          data:{
             stats
          }
        })
   
})


exports.getMonthlyPlan = catchAsync( async(req , res , next) => {
  


    const plan = await Tour.aggregate([
      {
        $unwind:"$startDates"
      },
      {
        $project:{
              name:1,
              summary:1,

        }
      }
    ])
        

     res.status(200).json({
       status:"success",
       result:plan.length,
       data:{
          plan
       }
     })

   })