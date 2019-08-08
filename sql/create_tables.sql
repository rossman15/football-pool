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
  teamId VARCHAR(3) NOT NULL,

  PRIMARY KEY (userId, week),
  UNIQUE KEY (userId, teamId),
  FOREIGN KEY (userId)
      REFERENCES footballpool.Users(id)
);

CREATE TABLE footballpool.Games (
  homeTeamId CHAR(3) NOT NULL,
  awayTeamId CHAR(3) NOT NULL,
  week INTEGER NOT NULL,
  date DATETIME NOT NULL,
  winner VARCHAR(3) DEFAULT NULL,

  PRIMARY KEY (homeTeamId, awayTeamId, week, date),
  UNIQUE KEY (homeTeamId, date),
  UNIQUE KEY (awayTeamId, date)
);

CREATE TABLE footballpool.VisibleWeeks (
  week INTEGER NOT NULL PRIMARY KEY,
  visible BOOLEAN NOT NULL DEFAULT 0
);
