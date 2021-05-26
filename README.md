# SMS Postscript.io HW Assignment:

What a fun assignment! :)

## 1) An explanation of my solution

My application utilizes a ReactJS Front-end that communicates via Fetch with Flask API endpoints. These endpoints are responsible for CRUD operations and work in conjunction with SQLAlchemy to communicate with a PostgreSQL database which currently contains one table for ‘messages’. User account information, company information, and product information are all hard coded as seed data into the React .js App file due to time constraints (in line with the 80/20 concept). The application is hosted on Docker, which contains three separate containers (one for the app, one for the api, and one for the database).

Flask is also responsible for calling on the Twilio API to send text messages through my Twilio trial account. Only whitelisted numbers currently work (my number, 9167594227, for example). 

There are 2 seed user accounts corresponding to two potential client companies. Logged in users can only view products associated with their company. Logged in users can also only view messages that they personally created or sent, not those created or sent by any other user (which means messages are associated to both product_id and user_id).

There are 2 message templates available in the sms message editor view, which can be customized to fit a user’s needs.

Along with the technologies listed, I am also utilizing the Semantic UI React css library as well as the Flask CORS dependency (a development tool for allowing smooth communication between my docker containers). 

## Seed data login information

ElizaBlank<br />
puppy2

LadyGaga<br />
musicismylife

## 2) New technologies to me

Although I had used Docker briefly in the past, I had some trouble with it here. The problems I ran into sent me down a few different rabbit holes that taught me a lot more about Docker than I had previously known.
Flask & SQLAlchemy were completely new to me.

## 3) Time spent

~ Actual writing of the application code : 6 hours<br />
~ Although I did spend additional time outside of the coding hours to learn the new technologies.

## Reflection

I’m happy with the application’s functionality and appearance, and was able to utilize all of the requested technologies. However, with more time, I would change a few things…

Utilize ‘composition’ with the React architecture <br />
Refactor some of my React logic<br />
Build out the database (to include users, companies, and products)<br />
Include field validation<br />
Error handling<br />
Communication with user / Application status / Alerts for things like…<br />
- Incorrect login credentials <br />
- Improperly formatted phone number entries<br />
Message sorting<br />

Connor Puhala 2021









 
