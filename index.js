const express = require('express');
const app = express();
const mongoose = require('mongoose');
//const shortid = require('shortid');

app.use(express.json());
require('dotenv').config();

//require the models
const Employee = require('./models/employee');
const Activity = require('./models/activity');
const EmployeePoints = require('./models/employeePoints');

//routes

//route for leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await EmployeePoints.aggregate([
            {
                $group: {
                    _id: '$employeeCode',
                    totalPoints: { $sum: '$pointsEarned' },
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: 'code',
                    as: 'employee',
                },
            },
            {
                $unwind: '$employee',
            },
            {
                $project: {
                    _id: 0,
                    'employee.name': 1,
                    totalPoints: 1,
                },
            },
            { $sort: { totalPoints: -1 } },
        ]);

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//route to display the points break-down
app.get('/pointsBreakDown/:employeeCode', async (req, res) => {
    try {
        const { employeeCode } = req.params;

        //find employee points using the employee code
        const employeePoints = await EmployeePoints.findOne({ employeeCode });

        if (!employeePoints) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        //pointsBreakDown as an array of activity points
        const activityPoints = employeePoints.pointsBreakDown.split(',').map(Number);

        res.json({ activityPoints });
    } catch (error) {
        console.error('Error fetching points breakdown:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//route to perform the calculation
app.post('/calculation', async (req, res) => {
    try {
        const { employeeCode, activityName } = req.body;

        //find the employee
        const employee = await Employee.findOne({ code: employeeCode });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        //find the activity points
        const activity = await Activity.findOne({ name: activityName });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        //update points
        const newPoints = activity.points;

        //update EmployeePoints document
        let employeePoints = await EmployeePoints.findOne({ employeeCode });

        if (!employeePoints) {
            employeePoints = new EmployeePoints({
                employeeCode,
                pointsEarned: newPoints,
                pointsBreakDown: `${newPoints}`,
            });
        } else {
            employeePoints.pointsEarned += newPoints;
            employeePoints.pointsBreakDown += `,${newPoints}`;
        }

        await employeePoints.save();

        res.json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


mongoose.connect(process.env.DB_URL)
.then(()=> {
    console.log('connected to DB!');
    //console.log(shortid.generate());
    app.listen(process.env.PORT, ()=>{
        console.log(`server started at port ${process.env.PORT}!`)
    })
}).catch((error)=>{
    console.log(error);
})