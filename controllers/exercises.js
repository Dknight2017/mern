const Exercise = require('../models/Exercise.js')

module.exports = {
	// list all the exercises
	index: (req, res) => {
        
		Exercise.find(({by: req.session.user._id}), (err, allDatUsersExercises) => {
			res.json(allDatUsersExercises) ////////
		})
	},

	// show and or get an exercise
	show: (req, res) => {
		console.log("Current Exercise:")
		console.log(req.exercise)
		Exercise.findById(req.params.id, (err, exercise) => {
			res.json(exercise)
		})
    },

	// create a new exercise
	create: (req, res) => {
        console.log(req.body)
		Exercise.create({...req.body, by: req.session.user._id }, (err, exercise) => {
            if(err) return res.json({success: false, code: err.code})
            res.json(exercise)
		})
	},//

    // edit an existing exercise 
    update: (req, res) => {
        console.log(req.params.id)
        Exercise.findById(req.params.id, (err, exercise) => {
            Object.assign(exercise, req.body)
            exercise.save((err, updatedExercise)=> {
                res.json({success: true, message: "Exercise edited.", updatedExercise})
            })
        })
    },

	// delete an exercise
	destroy: (req, res) => {
		Exercise.findByIdAndRemove(req.params.id, (err, exercise) => {
			res.json({success: true, message: "Exercise deleted.", exercise})
		})
	},
}

