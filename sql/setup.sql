-- login as root and create this user
CREATE USER 'ross'@'localhost' IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON * . * TO 'ross'@'localhost';
