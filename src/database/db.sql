CREATE DATABASE chatbot_favip;
USE chatbot_favip;

CREATE TABLE phone (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(25) NOT NULL UNIQUE,
    created_at DATE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE current_service (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(25) NOT NULL UNIQUE,
	created_at DATE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE evaluation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fk_phone INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),  
    created_at DATE DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (fk_phone) REFERENCES phone(id)
);