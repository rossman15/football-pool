INSERT INTO
  footballpool.Users (name, isAdmin, email, passcode)
VALUES
('Ross', true, 'rossmckay15@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5)),
('Joe', false, 'joe@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5)),
('Bob', false, 'bob@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5)),
('Sam', false, 'sam@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5)),
('Mike', false, 'mike@yahoo.com', SUBSTRING(MD5(RAND()) FROM 1 FOR 5));

INSERT INTO
  footballpool.Picks (userId, week, teamId)
VALUES
(1, 1, 'det'),
(1, 2, 'atl'),
(1, 3, 'pit'),
(1, 4, 'chi'),

(2, 1, 'bal'),
(2, 2, 'cle'),

(3, 1, 'ind'),

(4, 1, 'tb'),
(4, 2, 'phi'),
(4, 3, 'nyj'),
(4, 4, 'car'),

(5, 1, 'pit'),
(5, 2, 'buf');
