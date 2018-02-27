const 
    express = require('express'),
    exercisesRouter = new express.Router(),
    exercisesCtrl = require('../controllers/exercises.js')
 
    
    exercisesRouter.route('/')
        .get(exercisesCtrl.index)
        .post(exercisesCtrl.create)


    exercisesRouter.route('/:id')
        .get(exercisesCtrl.show)
        .patch(exercisesCtrl.update)
        .delete(exercisesCtrl.destroy)
    
module.exports = exercisesRouter