const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');


// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});



const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload only image files'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'FCI'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || '#secureSession123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day to cookie session is valid
    }
}));


app.use('/files', express.static(path.join(__dirname, 'files')));
// Redirect root to the files directory
app.get('/', (req, res) => {
    res.redirect('http://localhost:3000/files');
});

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
};

app.get('/api/is_admin', isAuthenticated, (req, res) => {
    console.log("Session user:", req.session.user); // Log session user
    if (req.session.user && req.session.user.role === 'admin') {
        res.json({ isAdmin: true });
    } else {
        res.status(403).json({ isAdmin: false });
    }
});


// Middleware to check if the user is a student
const isStudent = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
};

app.post('/signup', (req, res) => {
    upload.single('image')(req, res, async function (err) {
        if (err) {
            // Handle file upload errors (e.g., invalid file type)
            console.error('File upload error:', err);
            return res.status(400).json({ error: 'Please upload a valid image file' });
        }

        try {
            const { first_name, last_name, phone_num, email, password, level, gender, role } = req.body;

            // Validate required fields
            if (!first_name || !last_name || !phone_num || !email || !password || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const image = req.file ? req.file.filename : null;

            // Insert user data into the database
            const insertUserQuery = `INSERT INTO user (first_name, last_name, phone_num, email, password, role, gender, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const userValues = [first_name, last_name, phone_num, email, hashedPassword, role, gender, image];

            db.query(insertUserQuery, userValues, (err, userResults) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ error: 'Error inserting user into the database' });
                }

                const user_id = userResults.insertId;
                let insertRoleQuery;
                let roleValues;

                if (role === 'admin') {
                    insertRoleQuery =` INSERT INTO admin (user_id) VALUES (?)`;
                    roleValues = [user_id];
                } else if (role === 'student') {
                    insertRoleQuery = `INSERT INTO student (user_id, level) VALUES (?, ?)`;
                    roleValues = [user_id, level];
                } else {
                    return res.status(400).json({ error: 'Invalid role' });
                }

                db.query(insertRoleQuery, roleValues, (err) => {
                    if (err) {
                        console.error('Error inserting role data:', err);
                        return res.status(500).json({ error: 'Error inserting role data into the database' });
                    }
                    res.status(201).json({ message: 'User created successfully' });
                });
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.user = {
                user_id: user.user_id,  // Ensure user_id is set correctly
                role: user.role
            };

            if (user.role === 'student') {
                const [studentResult] = await db.promise().query('SELECT level FROM student WHERE user_id = ?', [user.user_id]);
                req.session.user.level = studentResult[0]?.level;
                res.json({ success: true, role: 'student' });
            } else if (user.role === 'admin') {
                res.json({ success: true, role: 'admin' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

app.get('/api/student/profile', isAuthenticated, isStudent, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  
    try {
      // Fetch the student profile using a raw SQL query
      const [profile] = await db.promise().query(
        'SELECT u.first_name, u.last_name, u.email, u.gender, s.level, u.image FROM user u JOIN student s ON u.user_id = s.user_id WHERE u.user_id = ?',
        [req.session.user.user_id]
      );
  
      if (profile.length === 0) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }
  
      res.json({ success: true, profile: profile[0] });
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
  });

app.get('/admin/admin-profile',isAuthenticated, isAdmin, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { user_id } = req.session.user;
        const query = `
            SELECT u.first_name, u.last_name, u.email,phone_num, u.gender, u.image
            FROM user u
            JOIN admin a ON u.user_id = a.user_id
            WHERE u.user_id = ?`;

        const [profile] = await db.promise().query(query, [user_id]);
        
        if (profile.length === 0) {
            return res.status(404).json({ success: false, message: 'Admin profile not found' });
        }

        res.json({ success: true, profile: profile[0] });
    } catch (error) {
        console.error('Admin profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});


app.get('/api/student/courses', isAuthenticated, isStudent, async (req, res) => {
    const { level } = req.query;
    
    if (!level) {
      return res.status(400).json({ error: 'Level parameter is required' });
    }
  
    try {
      // Ensure the query uses the correct column name
      const [courses] = await db.promise().query('SELECT * FROM course WHERE level = ?', [level]);
      res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// Example using Express.js and MySQL
app.get('/api/student/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }

    try {
        console.log(`Fetching course with ID: ${courseId}`);
        const [rows] = await db.promise().query('SELECT * FROM course WHERE course_id = ?', [courseId]);
        console.log('Raw database result:', JSON.stringify(rows, null, 2));

        if (rows.length > 0) {
            const course = rows[0];
            console.log('Sending course data:', JSON.stringify(course, null, 2));
            res.json(course);
        } else {
            console.log(`No course found with ID: ${courseId}`);
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (err) {
        console.error('Error fetching course details:', err);
        res.status(500).json({ message: 'An error occurred while fetching course details', error: err.message });
    }
});

// app.get('/api/student/courses',isAuthenticated, isStudent, async (req, res) => {
//     const { level } = req.query;
    
//     if (!level) {
//       return res.status(400).json({ error: 'Level parameter is required' });
//     }
  
//     try {
//       // Make sure to match the level exactly as stored in your database
//       const [courses] = await db.promise().query('SELECT * FROM course WHERE level = ?', [level]);
//       res.json(courses);
//     } catch (error) {
//       console.error('Error fetching courses:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

// // Route to fetch course details by courseId
// app.get('/api/student/courses/:courseId', async (req, res) => {
//     const { courseId } = req.params;
  
//     try {
//       const [rows] = await pool.query('SELECT * FROM courses WHERE courses_id = ?', [courseId]);
  
//       if (rows.length > 0) {
//         res.json(rows[0]);
//       } else {
//         res.status(404).json({ message: 'Course not found' });
//       }
//     } catch (err) {
//       console.error('Error fetching course details:', err);
//       res.status(500).json({ message: 'An error occurred while fetching course details' });
//     }
//   });

  //send notification

  app.post('/admin/send-message',isAuthenticated, isAdmin, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, message, sendMethod, recipientEmail } = req.body;

    try {
        // Fetch the admin's profile using the logged-in user's ID
        const [adminProfile] = await db.promise().query('SELECT * FROM admin WHERE user_id = ?', [req.session.user.user_id]);
        
        if (adminProfile.length === 0) {
            return res.status(404).json({ success: false, message: 'Admin profile not found' });
        }

        const admin = adminProfile[0];

        if (sendMethod === 'all') {
            // Get all students
            const [students] = await db.promise().query("SELECT student_id, email FROM student INNER JOIN user ON student.user_id = user.user_id WHERE user.role = 'student'");

            // Create a transporter object using nodemailer
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.ADMIN_EMAIL,
                    pass: process.env.ADMIN_EMAIL_PASSWORD,
                },
            });

            // Send an email to each student and insert records into receive_notification
            for (const student of students) {
                // Send email
                await transporter.sendMail({
                    from: process.env.ADMIN_EMAIL,
                    to: student.email,
                    subject: title,
                    text: message,
                });

                // Insert notification record into receive_notification
                await db.promise().query(
                    'INSERT INTO receive_notification (title, content, send_at, student_id, communication_method, is_read) VALUES (?, ?, NOW(), ?, ?, ?)',
                    [title, message, student.student_id, 'email', false]
                );
            }
        } else if (sendMethod === 'one' && recipientEmail) {
            // Get the recipient's student ID
            const [recipient] = await db.promise().query("SELECT student_id FROM student INNER JOIN user ON student.user_id = user.user_id WHERE user.email = ?", [recipientEmail]);

            if (recipient.length === 0) {
                return res.status(404).json({ success: false, message: 'Recipient not found' });
            }

            const studentId = recipient[0].student_id;

            // Send email
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.ADMIN_EMAIL,
                    pass: process.env.ADMIN_EMAIL_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.ADMIN_EMAIL,
                to: recipientEmail,
                subject: title,
                text: message,
            });

            // Insert notification record into receive_notification
            await db.promise().query(
                'INSERT INTO receive_notification (title, content, send_at, student_id, communication_method, is_read) VALUES (?, ?, NOW(), ?, ?, ?)',
                [title, message, studentId, 'email', false]
            );
        } else {
            return res.status(400).json({ message: 'Invalid send method or missing recipient email' });
        }

        // Insert notification record into send_notification
        await db.promise().query(
            'INSERT INTO send_notification (title, message, created_at, send_method, admin_id) VALUES (?, ?, NOW(), ?, ?)',
            [title, message, sendMethod, admin.admin_id]
        );

        res.status(200).json({ message: 'Notification sent successfully!' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Error sending notification' });
    }
});

app.get('/student/receive-notifications',isAuthenticated, isStudent, async (req, res) => {
    if (req.session.user && req.session.user.role === 'student') {
        const { user_id } = req.session.user;

        try {
            // Get the student ID from the user ID
            const [studentResult] = await db.promise().query('SELECT student_id FROM student WHERE user_id = ?', [user_id]);
            const studentId = studentResult[0]?.student_id;

            if (!studentId) {
                return res.status(404).json({ message: 'Student not found' });
            }

            // Fetch notifications for the student
            const [notifications] = await db.promise().query('SELECT * FROM receive_notification WHERE student_id = ?', [studentId]);
            res.json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Server error. Please try again later.' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});


  
//send message from student to admin
app.post('/student/send-message',isAuthenticated, isStudent, async (req, res) => {
    // Check if the user is logged in and is a student
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, message } = req.body;

    try {
        // Fetch the student's profile using the logged-in user's ID
        const [studentProfile] = await db.promise().query('SELECT * FROM student WHERE user_id = ?', [req.session.user.user_id]);

        if (studentProfile.length === 0) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const student = studentProfile[0];

        // Create a transporter object using nodemailer
        let transporter = nodemailer.createTransport({
            // service: 'gmail',
            host: 'smtp.gmail.com', // Use the correct SMTP server
            port: 587, // Port 587 is typically used for TLS
            secure: false, // Set to true if using port 465
            auth: {
                user: process.env.ADMIN_EMAIL, // Your email address (the fixed admin email)
                pass: process.env.ADMIN_EMAIL_PASSWORD, // Admin's email password from environment variables
            },
        });

        // Send an email to the admin
        await transporter.sendMail({
            from: student.email, // Student's email address
            to: process.env.ADMIN_EMAIL, // Admin's email address (fixed)
            subject: title, // Subject of the email
            text: message, // Body of the email
        });

        // Optionally, insert a record into the database
        await db.promise().query(
            'INSERT INTO send_notification (title, message, created_at, send_method, student_id) VALUES (?, ?, NOW(), ? , ?)',
            [title, message, 'one', student.student_id]
        );

        res.status(200).json({ message: 'Message sent successfully to the admin!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

app.get('/admin/students',isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [students] = await db.promise().query(
            `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_num, u.password, u.gender, u.image, s.level 
            FROM user u JOIN student s ON u.user_id = s.user_id`
        );
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/admin/courses', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [courses] = await db.promise().query(
            `SELECT  course_id, course_name, course_code, course_description, credit, level 
            FROM course`
        );
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Add a new student
app.post('/add-student',isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    const { first_name, last_name, phone_num, email, password, gender, level } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().beginTransaction();

        const [userResult] = await db.promise().query(
            'INSERT INTO user (first_name, last_name, phone_num, email, password, gender, role, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, phone_num, email, hashedPassword, gender, 'student', image]
        );

        const userId = userResult.insertId;

        await db.promise().query('INSERT INTO student (user_id, level) VALUES (?, ?)', [userId, level]);

        await db.promise().commit();

        res.status(201).json({ success: true, message: 'Student added successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get student details by ID
app.get('/student/:id', isAuthenticated, isAdmin, async (req, res) => {
    const studentId = req.params.id;

    try {
        // Query to fetch student details along with user information
        const [results] = await db.promise().query(`
            SELECT u.user_id, u.first_name, u.last_name, u.phone_num, u.email, u.password, u.gender, u.image, s.level
            FROM user u
            JOIN student s ON u.user_id = s.user_id
            WHERE u.user_id = ?
        `, [studentId]);

        if (results.length > 0) {
            res.json({ success: true, student: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




// Edit student details
app.put('/edit-student/:id',isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    const studentId = req.params.id;
    const { first_name, last_name, phone_num, email, password, gender, level } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        await db.promise().beginTransaction();

        let updateQuery = `
            UPDATE user u
            JOIN student s ON u.user_id = s.user_id
            SET u.first_name = ?, u.last_name = ?, u.phone_num = ?, u.email = ?, u.gender = ?, s.level = ?`;
        let updateParams = [first_name, last_name, phone_num, email, gender, level];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `, u.password = ?`;
            updateParams.push(hashedPassword);
        }

        if (image) {
            updateQuery +=` , u.image = ?`;
            updateParams.push(image);
        }

        updateQuery += ` WHERE u.user_id = ?`;
        updateParams.push(studentId);

        await db.promise().query(updateQuery, updateParams);

        await db.promise().commit();

        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error updating student:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/add-students-bulk', isAuthenticated, isAdmin,async (req, res) => {
    const students = req.body;
    console.log('Received students data:', students); // Log received data

    try {
        const addedStudents = []; // Array to store successfully added students
        for (const student of students) {
            const {
                'First Name': first_name,
                'Last Name': last_name,
                Email: email,
                'Phone Number': phone_num,
                Gender: gender,
                Image: image,
                Level: level,
                Password: password
            } = student;

            // Check if password is present
            if (!password) {
                throw new Error('Password is required for each student.');
            }

            // Convert password to string and hash it
            const hashedPassword = await bcrypt.hash(password.toString(), 10);

            // Insert into user table
            const [userResult] = await db.promise().query(
                'INSERT INTO user (first_name, last_name, email, phone_num, gender, image, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [first_name, last_name, email, phone_num, gender, image, hashedPassword, 'student']
            );

            const userId = userResult.insertId;

            // Insert into student table
            await db.promise().query(
                'INSERT INTO student (user_id, level) VALUES (?, ?)',
                [userId, level]
            );
        }

        res.status(200).json({ success: true, message: 'Students added successfully.' });
    } catch (error) {
        console.error('Error adding students:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Failed to add students.' });
    }
});

// Route to handle bulk course upload
app.post('/add-courses-bulk',isAuthenticated, isAdmin, async (req, res) => {
    const courses = req.body;
    console.log('Received courses data:', courses); // Log received data

    try {
        for (const course of courses) {
            const {
                'Course Name': course_name,
                'Course Code': course_code,
                'Course Description': course_description,
                Credit: credit,
                Level: level
            } = course;

            // Insert into course table
            await db.promise().query(
                'INSERT INTO course (course_name, course_code, course_description, credit, level) VALUES (?, ?, ?, ?, ?)',
                [course_name, course_code, course_description, credit, level]
            );
        }

        res.status(200).json({ success: true, message: 'Courses added successfully.' });
    } catch (error) {
        console.error('Error adding courses:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Failed to add courses.' });
    }
});

// Delete student route
app.delete('/delete-student/:id',isAuthenticated, isAdmin, async (req, res) => {
    const studentId = req.params.id;

    try {
        await db.promise().beginTransaction();

        await db.promise().query('DELETE FROM student WHERE user_id = ?', [studentId]);
        await db.promise().query('DELETE FROM user WHERE user_id = ?', [studentId]);

        await db.promise().commit();

        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});









// Add a new course
app.post('/api/courses',isAuthenticated, isAdmin, (req, res) => {
    const { course_name, course_code, course_description, credit, level } = req.body;
    const sql = 'INSERT INTO course (course_name, course_code, course_description, credit, level) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [course_name, course_code, course_description, credit, level], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Search for courses by name
app.get('/api/courses/search',isAuthenticated, isAdmin, (req, res) => {
    const { course_name } = req.query;
    const sql = 'SELECT * FROM course WHERE course_name LIKE ?';
    console.log('Searching for course:', course_name); // Add this line
    db.query(sql, [`%${course_name}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err); // Add error logging
            return res.status(500).send('Database error');
        }
        console.log('Query results:', results); // Log the results
        res.send(results);
    });
});
// Update a course
/*app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const { course_name, course_code, course_description, credit, level } = req.body;
    const sql = 'UPDATE course SET course_name = ?, course_code = ?, course_description = ?, credit = ?, level = ? WHERE course_id = ?';
    db.query(sql, [course_name, course_code, course_description, credit, level, id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});*/
/*app.put('/api/course/:id', async (req, res) => {
    const courseId = req.params.id;
    const updatedData = req.body;
    try {
        await db.query('UPDATE courses SET ? WHERE id = ?', [updatedData, courseId]);
        res.status(200).send('Course updated successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
});
*/

// Fetch course details
// Fetch course details
app.get('/api/course/:id',isAuthenticated, isAdmin, async (req, res) => {
    const courseId = req.params.id;
    try {
        const [rows] = await db.promise().query('SELECT * FROM course WHERE course_id = ?', [courseId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Course not found');
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).send('Server error');
    }
});

// Update a course by ID
// Update course

// Update a course by ID
app.put('/api/course/:id', isAuthenticated, isAdmin, async (req, res) => {
    const courseId = req.params.id;
    const { course_name, course_code, course_description, credit, level } = req.body;

    try {
        // Build the SQL update query dynamically
        const updateQuery = `
            UPDATE course
            SET course_name = ?, course_code = ?, course_description = ?, credit = ?, level = ?
            WHERE course_id = ?`;
        const updateParams = [course_name, course_code, course_description, credit, level, courseId];

        // Execute the update query
        const [result] = await db.promise().query(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.json({ success: true, message: 'Course updated successfully' });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// app.put('/api/course/:id',isAuthenticated, isAdmin, async (req, res) => {
//     const courseId = req.params.id;
//     const { course_name, course_code, course_description, credit, level } = req.body;

//     try {
//         const updateData = {};
//         if (course_name) updateData.course_name = course_name;
//         if (course_code) updateData.course_code = course_code;
//         if (course_description) updateData.course_description = course_description;
//         if (credit) updateData.credit = credit;
//         if (level) updateData.level = level;

//         await db.promise().query('UPDATE course SET ? WHERE course_id = ?', [updateData, courseId]);

//         res.status(200).send('Course updated successfully');
//     } catch (error) {
//         console.error('Error updating course:', error);
//         res.status(500).send('Server error');
//     }
// });


// Delete student route
app.delete('/delete-student/:id',isAuthenticated, isAdmin, async (req, res) => {
    const studentId = req.params.id;

    try {
        await db.promise().beginTransaction();

        await db.promise().query('DELETE FROM student WHERE user_id = ?', [studentId]);
        await db.promise().query('DELETE FROM user WHERE user_id = ?', [studentId]);

        await db.promise().commit();

        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a course
app.delete('/api/courses/:id',isAuthenticated, isAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM course WHERE course_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get('/admin/admins',isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [students] = await db.promise().query(
            `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_num, u.password, u.gender, u.image 
            FROM user u JOIN admin a ON u.user_id = a.user_id`
        );
        res.json(students);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/add-admin',isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    const { first_name, last_name, phone_num, email, password, gender } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().beginTransaction();

        const [userResult] = await db.promise().query(
            'INSERT INTO user (first_name, last_name, phone_num, email, password, gender, role, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, phone_num, email, hashedPassword, gender, 'admin', image]
        );

        const userId = userResult.insertId;

        await db.promise().query('INSERT INTO admin (user_id) VALUES (?)', [userId]);

        await db.promise().commit();

        res.status(201).json({ success: true, message: 'Admin Student added successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error adding Admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/admin/:id', isAuthenticated, isAdmin, async (req, res) => {
    const adminId = req.params.id;

    try {
        const [results] = await db.promise().query(`
            SELECT u.user_id, u.first_name, u.last_name, u.phone_num, u.email, u.password, u.gender, u.image
            FROM user u
            JOIN admin a ON u.user_id = a.user_id
            WHERE u.user_id = ?
        `, [adminId]);

        if (results.length > 0) {
            res.json({ success: true, admin: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'Admin not found' });
        }
    } catch (error) {
        console.error('Error fetching admin details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Edit admin details by ID
app.put('/edit-admin/:id', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    const adminId = req.params.id;
    const { first_name, last_name, phone_num, email, password, gender } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        await db.promise().beginTransaction();

        let updateQuery = `
            UPDATE user u
            JOIN admin a ON u.user_id = a.user_id
            SET u.first_name = ?, u.last_name = ?, u.phone_num = ?, u.email = ?, u.gender = ?`;
        let updateParams = [first_name, last_name, phone_num, email, gender];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery +=` , u.password = ?`;
            updateParams.push(hashedPassword);
        }

        if (image) {
            updateQuery += `, u.image = ?`;
            updateParams.push(image);
        }

        updateQuery +=`  WHERE u.user_id = ?`;
        updateParams.push(adminId);

        await db.promise().query(updateQuery, updateParams);
        await db.promise().commit();

        res.json({ success: true, message: 'Admin updated successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error updating admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// Delete student route
app.delete('/delete-admin/:id',isAuthenticated, isAdmin, async (req, res) => {
    const adminId = req.params.id;

    try {
        await db.promise().beginTransaction();

        await db.promise().query('DELETE FROM admin WHERE user_id = ?', [adminId]);
        await db.promise().query('DELETE FROM user WHERE user_id = ?', [adminId]);

        await db.promise().commit();

        res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ message: 'Logged out successfully.' });
    });
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
