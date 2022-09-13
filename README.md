# Auth0 + OpenFGA - Relationship-Based Access Control

https://bit.ly/3L5qeND

Pre-requisites:

1.) Auth0 tenant - https://auth0.com/signup
2.) Auth0 FGA service - https://dashboard.fga.dev/
3.) Sample app listed here - https://bit.ly/3L5qeND

To run:

Step 1: Within the working folder, run ```npm install``` <br>
Step 2: run ```npm start``` <br>
Step 3: All Test users have a password of ```Welcome1``` <br>

Test users: <br>
matt@example.com - Manager <br>
sam@example.com - Employee <br>
daniel@example.com - Manager
peter@example.com - Employee <br>



FGA Setup:

Model Explorer:

```
type expense
  relations
    define approver as manager from submitter
    define rejecter as manager from submitter
    define submitter as self
    define viewer as self or submitter or approver
type employee
  relations
    define manager as self or manager from manager
```

![image](https://user-images.githubusercontent.com/47293714/189871942-b90a0cd8-5043-4451-a05c-1f84205414ef.png)

Tuple Management:

![image](https://user-images.githubusercontent.com/47293714/189872464-0b44c1e7-cd84-4f3d-afe8-fd7f9efe4eb4.png)

