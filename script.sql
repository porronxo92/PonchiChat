drop table if exists  messages;
drop table if exists users;
 
CREATE TABLE users (id UUID primary key NOT NULL DEFAULT gen_random_uuid (),
								 nombre VARCHAR (255) NOT null
								 );
								 
create table messages (id UUID primary key NOT NULL DEFAULT gen_random_uuid (), 	
						mensaje text not null,
						fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

