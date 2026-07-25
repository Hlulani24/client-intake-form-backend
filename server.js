const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Vodacom backend is running' });
});

const dateOrNull = (val) => (val === '' || val === undefined ? null : val);

// Submit application route
app.post('/submit-application', (req, res) => {
  const {
    // Customer Details
    title, initials, surname, first_name, gender, marital_status,
    identity_type, id_passport_no, passport_country, passport_exp_date,
    date_of_birth, home_tel, unit_no, building_name, street_no,
    street_name, town_city, province, physical_code, postal_address,
    postal_code, residence, bill_via_email, email, lines_required,

    // Relative Details
    relative_first_name, relative_surname, relative_tel, relative_relationship,

    // Employment Details
    company_name, occupation, salary_date, gross_income,

    // Payment Details
    bank_type, age_of_account, debit_order_date, acc_holder_name,
    bank_name, account_no, branch_name, bank_code,

    // Suretyship
    surety_title, surety_initials, surety_first_name, surety_surname,
    surety_relationship, surety_dob, surety_home_tel, surety_gender,
    surety_marital_status, surety_identity_type, surety_id_passport_no,
    surety_passport_country, surety_passport_exp_date, surety_employer,
    surety_occupation, surety_gross_income, surety_unit_no,
    surety_building_name, surety_street_no, surety_street_name,
    surety_town_city, surety_province, surety_code

  } = req.body;

  const values = [
    title, initials, surname, first_name, gender, marital_status,
    identity_type, id_passport_no, passport_country, dateOrNull(passport_exp_date),
    dateOrNull(date_of_birth), home_tel, unit_no, building_name, street_no,
    street_name, town_city, province, physical_code, postal_address,
    postal_code, residence, bill_via_email, email, lines_required,
    relative_first_name, relative_surname, relative_tel, relative_relationship,
    company_name, occupation, salary_date, gross_income,
    bank_type, dateOrNull(age_of_account), debit_order_date, acc_holder_name,
    bank_name, account_no, branch_name, bank_code,
    surety_title, surety_initials, surety_first_name, surety_surname,
    surety_relationship, dateOrNull(surety_dob), surety_home_tel, surety_gender,
    surety_marital_status, surety_identity_type, surety_id_passport_no,
    surety_passport_country, dateOrNull(surety_passport_exp_date), surety_employer,
    surety_occupation, surety_gross_income, surety_unit_no,
    surety_building_name, surety_street_no, surety_street_name,
    surety_town_city, surety_province, surety_code
  ];

  // Auto-generate placeholders — always matches values exactly
  const placeholders = values.map(() => '?').join(', ');

  const sql = `INSERT INTO applications (
    title, initials, surname, first_name, gender, marital_status,
    identity_type, id_passport_no, passport_country, passport_exp_date,
    date_of_birth, home_tel, unit_no, building_name, street_no,
    street_name, town_city, province, physical_code, postal_address,
    postal_code, residence, bill_via_email, email, lines_required,
    relative_first_name, relative_surname, relative_tel, relative_relationship,
    company_name, occupation, salary_date, gross_income,
    bank_type, age_of_account, debit_order_date, acc_holder_name,
    bank_name, account_no, branch_name, bank_code,
    surety_title, surety_initials, surety_first_name, surety_surname,
    surety_relationship, surety_dob, surety_home_tel, surety_gender,
    surety_marital_status, surety_identity_type, surety_id_passport_no,
    surety_passport_country, surety_passport_exp_date, surety_employer,
    surety_occupation, surety_gross_income, surety_unit_no,
    surety_building_name, surety_street_no, surety_street_name,
    surety_town_city, surety_province, surety_code
  ) VALUES (${placeholders})`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log('Error saving application:', err.message);
      res.status(500).json({ success: false, message: 'Failed to save application' });
    } else {
      console.log('Application saved, ID:', result.insertId);
      res.status(200).json({ success: true, message: 'Application submitted successfully', id: result.insertId });
    }
  });
});

// Get all applications route
app.get('/applications', (req, res) => {
  const sql = 'SELECT id, title, first_name, surname, email, home_tel, company_name, submitted_at FROM applications ORDER BY submitted_at DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.log('Error fetching applications:', err.message);
      res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    } else {
      res.status(200).json({ success: true, applications: results });
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
