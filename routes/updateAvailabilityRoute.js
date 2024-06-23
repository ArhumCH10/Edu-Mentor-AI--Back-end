const express = require('express');
const router = express.Router();
const Teacher = require('../models/teacherSchema');

router.post('/Update-Availability', async (req, res) => {
    try {
        const userId = req.query.userId;

        const { timezone, availability } = req.body;

        const teacher = await Teacher.findById(userId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        let updatedAvailability = [];

        availability.forEach(day => {
            // techer ka pehly sy day hai ya ni
            const existingDay = teacher.availability.find(item => item.day === day.day);

            if (existingDay) {
                const isNewSlot = day.slots.some(newSlot => {
                    return !existingDay.slots.some(existingSlot =>
                        existingSlot.from === newSlot.from && existingSlot.to === newSlot.to
                    );
                });

                if (isNewSlot) {
                    existingDay.slots.push(...day.slots);
                    updatedAvailability.push(existingDay);
                } else {
                    updatedAvailability.push(existingDay);
                }
            } else {
                updatedAvailability.push({
                    day: day.day,
                    timezone: timezone,
                    slots: day.slots.map(slot => ({
                        from: slot.from,
                        to: slot.to
                    }))
                });
            }
        });


        // updatedAvailability duplicates delete kiye
        const uniqueAvailability = [];
        const dayMap = new Map();

        updatedAvailability.forEach(day => {
            if (!dayMap.has(day.day)) {
                dayMap.set(day.day, true);
                uniqueAvailability.push(day);
            }
        });

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            userId,
            { $set: { availability: uniqueAvailability } },
            { new: true }
        );

        res.status(200).json({
            message: "User information updated successfully",
            updatedTeacher,
        });
    } catch (error) {
        console.error("Availability error", error);
        return res.status(500).json({ message: "An Unexpected Error Occurred" });
    }
});

module.exports = router;
