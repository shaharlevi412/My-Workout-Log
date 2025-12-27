require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// חיבור למסד הנתונים
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Cloud!'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// הגדרת מבנה התרגיל (Schema)
const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    muscle: { type: String, required: true },
    sets: { type: Number },
    reps: { type: Number },
    weight: { type: Number },
    date: { type: Date, required: true }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// נתיב לקבלת כל התרגילים (היסטוריה)
app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({ date: -1 });
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// נתיב לשמירת תרגיל חדש
app.post('/api/exercises', async (req, res) => {
    try {
        const newExercise = new Exercise({
            name: req.body.name,
            muscle: req.body.muscle,
            sets: req.body.sets,
            reps: req.body.reps,
            weight: req.body.weight,
            date: req.body.date 
        });
        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// נתיב למחיקת אימון שלם לפי תאריך
app.delete('/api/exercises/by-date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await Exercise.deleteMany({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        res.json({ message: "האימון נמחק בהצלחה", count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));