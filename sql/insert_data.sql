INSERT INTO
  footballpool.Users (name, isAdmin, email, passcode)
VALUES
('Ross', true, 'rossmckay15@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5)),
('Mike', false, 'mike@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5));

INSERT INTO
  footballpool.Picks (userId, week, teamId)
VALUES
(1, 1, 'det'),
(1, 2, 'atl'),
(1, 3, 'pit'),
(2, 1, 'bal'),
(2, 2, 'cle');
