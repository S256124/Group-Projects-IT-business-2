ssh gb09@nuc01.dbl.engtech.dtu.dk
gb09@nuc01:~$ cd public
gb09@nuc01:~/public$ ls
gb09@nuc01:~/public$ mariadb -u gb09_DB -p gb09_DB_password
SHOW TABLES;
DESCRIBE users;
CREATE TABLE recipes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)  UNIQUE KEY NOT NULL,
    rating FLOAT NOT NULL,
    times_clicked INT NOT NULL, 
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
)
CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL FOREIGN KEY (user_id) REFERENCES users(id),
    rating FLOAT NOT NULL,
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
CREATE TABLE your_choice (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY (user_id) REFERENCES users(id),
    recipe_id INT NOT NULL FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

