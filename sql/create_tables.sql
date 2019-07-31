CREATE TABLE footballpool.Users (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  isAdmin BOOLEAN,
  passcode VARCHAR(20),
  authorization VARCHAR(20),
  email VARCHAR(50)
);

CREATE TABLE footballpool.Picks (
  userId INTEGER NOT NULL,
  week INTEGER NOT NULL,
  teamId CHAR(3) NOT NULL,

  PRIMARY KEY (userId, week),
  UNIQUE KEY (userId, teamId),
  FOREIGN KEY (userId)
      REFERENCES footballpool.Users(id)
);
