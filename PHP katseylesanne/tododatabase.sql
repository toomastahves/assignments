create database tododb;

grant select, insert, update, delete on tododb.* to todouser identified by 'betterpassword';

use tododb;

create table tasks (
	taskid int unsigned not null auto_increment primary key,
	title char(50) not null,
	status char(15) not null,
	deadline date not null
);

INSERT INTO tasks VALUES (NULL,'New task','Open','2014-05-10');
INSERT INTO tasks VALUES (NULL,'Best job','In progress','2014-04-20');
INSERT INTO tasks VALUES (NULL,'Old work','Closed','2013-03-03');
INSERT INTO tasks VALUES (NULL,'New task 2','Open','2014-08-10');
INSERT INTO tasks VALUES (NULL,'Best job 3','Open','2014-03-20');
INSERT INTO tasks VALUES (NULL,'Old work 5','In progress','2013-02-03');
INSERT INTO tasks VALUES (NULL,'New task 7','In progress','2014-08-15');
INSERT INTO tasks VALUES (NULL,'Best job 5','Closed','2014-12-26');
INSERT INTO tasks VALUES (NULL,'Old work 3','Closed','2013-10-08');
