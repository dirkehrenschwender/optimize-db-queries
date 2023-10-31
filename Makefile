# Makefile

DB_USER=user
DB_PASS=password
DB_NAME=employees
DB_HOST=127.0.0.1
CONTAINER_NAME=db-queries

start: start-docker start-npm

start-docker:
	@docker-compose up -d
	@sleep 10

start-npm:
	@npm i
	@npm run start

connect-db:
	@docker exec -it $(CONTAINER_NAME) mariadb -u$(DB_USER) -p$(DB_PASS) -h$(DB_HOST) $(DB_NAME)

connect-db-admin:
	@docker exec -it $(CONTAINER_NAME) mariadb -uroot -proot_password_here -h$(DB_HOST) $(DB_NAME)

get-slow-query:
	@docker exec $(CONTAINER_NAME) mariadb -uroot -proot_password_here -h$(DB_HOST) $(DB_NAME) -e "SELECT t.query_time, t.rows_sent, t.rows_examined, t.sql_text FROM mysql.slow_log t ORDER BY query_time DESC LIMIT 5;"

finance:
	@curl -s -o /dev/null -w "%{time_total}s\n" http://localhost:3000/employees/finance

history:
	@curl -s -o /dev/null -w "%{time_total}s\n" http://localhost:3000/employees/history

senior:
	@curl -s -o /dev/null -w "%{time_total}s\n" http://localhost:3000/employees/senior

explain-finance:
	@docker exec $(CONTAINER_NAME) mariadb -u$(DB_USER) -p$(DB_PASS) -h$(DB_HOST) $(DB_NAME) -e "EXPLAIN SELECT * FROM employees e JOIN current_dept_emp cde ON e.emp_no = cde.emp_no JOIN departments d ON cde.dept_no = d.dept_no WHERE d.dept_name LIKE 'Finance' ORDER BY e.hire_date;"

explain-history:
	@docker exec $(CONTAINER_NAME) mariadb -u$(DB_USER) -p$(DB_PASS) -h$(DB_HOST) $(DB_NAME) -e "EXPLAIN SELECT *, 'Title Change' AS reason FROM titles UNION SELECT *, 'Salary Adjustment' AS reason FROM salaries ORDER BY emp_no, from_date;"

explain-senior:
	@docker exec $(CONTAINER_NAME) mariadb -u$(DB_USER) -p$(DB_PASS) -h$(DB_HOST) $(DB_NAME) -e "EXPLAIN SELECT * FROM employees e JOIN titles t ON e.emp_no = t.emp_no JOIN salaries s ON e.emp_no = s.emp_no WHERE YEAR(e.hire_date) > '1995' AND t.title = 'Senior Engineer' AND s.salary > 80000 AND t.to_date = '9999-01-01' AND s.to_date = '9999-01-01';"
