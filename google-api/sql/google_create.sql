-- https://docs.microsoft.com/en-us/previous-versions/sql/sql-server-2008/dd283095(v=sql.100)?redirectedfrom=MSDN
--create Google database
CREATE DATABASE [Google]
GO
USE Google
GO
CREATE TABLE [dbo].[table1](
       [pkcol] [int] IDENTITY(1,1) NOT NULL,
       [col1] [int] NULL,
PRIMARY KEY CLUSTERED ([pkcol])
)
GO
--create node_client user login
CREATE LOGIN [node_client] WITH PASSWORD=N''
GO
--create user in  database
CREATE USER [node_client] FOR LOGIN [node_client] WITH DEFAULT_SCHEMA=[Gmail]
GO
--create role
CREATE ROLE [AppUser_Role] AUTHORIZATION [dbo]
GO
--create schema
CREATE SCHEMA [Gmail] AUTHORIZATION [node_client]
GO
--apply permissions to schemas
GRANT ALTER ON SCHEMA::[Gmail] TO [AppUser_Role]
GO
GRANT CONTROL ON SCHEMA::[Gmail] TO [AppUser_Role]
GO
GRANT SELECT ON SCHEMA::[Gmail] TO [AppUser_Role]
GO
GRANT DELETE ON SCHEMA::[dbo] TO [AppUser_Role]
GO
GRANT INSERT ON SCHEMA::[dbo] TO [AppUser_Role]
GO
GRANT SELECT ON SCHEMA::[dbo] TO [AppUser_Role]
GO
GRANT UPDATE ON SCHEMA::[dbo] TO [AppUser_Role]
GO
GRANT REFERENCES ON SCHEMA::[dbo] TO [AppUser_Role]
GO
--ensure role membership is correct
EXEC sp_addrolemember N'AppUser_Role ', N'node_client'
GO
--allow users to create tables in Gmail
GRANT CREATE TABLE TO [AppUser_Role]
GO
--Allow user to connect to database
GRANT CONNECT TO [node_client]