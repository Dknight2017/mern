const // excercise Schema tells db what to look for 
    mongoose = require('mongoose'),
    exerciseSchema = new mongoose.Schema({
        exerciseName: {type: String },
        setAmount: { type: Number },
        repAmount: { type: Number },
    })

const Exercise = mongoose.model('Exercise', exerciseSchema)

module.exports = Exercise; 