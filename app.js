const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'user',
    password: 'password',
    database: 'employees',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/employees/finance', async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM employees e
            JOIN current_dept_emp cde ON e.emp_no = cde.emp_no
            JOIN departments d ON cde.dept_no = d.dept_no
            WHERE d.dept_name LIKE 'Finance'
            ORDER BY e.hire_date;
        `;
        
        console.time('Query Execution Time');
        const [rows] = await pool.execute(query);
        console.timeEnd('Query Execution Time');

        const result = rows.map(row => ({
            emp_no: row.emp_no,
            first_name: row.first_name,
            last_name: row.last_name,
            hire_date: row.hire_date,
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/employees/history', async (req, res) => {
    try {
        const query = `
            SELECT *, 'Title Change' AS reason
            FROM titles
            UNION
            SELECT *, 'Salary Adjustment' AS reason
            FROM salaries
            ORDER BY emp_no, from_date;
        `;

        console.time('Query Execution Time');
        const [rows] = await pool.execute(query);
        console.timeEnd('Query Execution Time');

        const result = rows.map(row => ({
            emp_no: row.emp_no,
            from_date: row.from_date
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/employees/senior', async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM employees e
            JOIN titles t ON e.emp_no = t.emp_no
            JOIN salaries s ON e.emp_no = s.emp_no
            WHERE YEAR(e.hire_date) > '1995'
            AND t.title = 'Senior Engineer'
            AND s.salary > 80000
            AND t.to_date = '9999-01-01'
            AND s.to_date = '9999-01-01';
        `;

        console.time('Query Execution Time');
        const [rows] = await pool.execute(query);
        console.timeEnd('Query Execution Time');

        const result = rows.map(row => ({
            emp_no: row.emp_no,
            first_name: row.first_name,
            last_name: row.last_name,
            title: row.title,
            salary: row.salary
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
