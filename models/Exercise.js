const // excercise Schema tells db what to look for 
    mongoose = require('mongoose'),
    exerciseSchema = new mongoose.Schema({
        exerciseName: {type: String },
        setAmount: { type: Number },
        repAmount: { type: Number },
        by:  [mongoose.Schema.Types.ObjectId] 
    })

const Exercise = mongoose.model('Exercise', exerciseSchema)

module.exports = Exercise; 