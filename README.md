# RockPaperScissors-Network

http://glacial-fortress-67224.herokuapp.com/

https://jesseharold.github.io/RockPaperScissors-Network/

A game of Rock, Paper, Scissors that you can play over the network with another player

Uses Firebase's realtime database to store game state. Learn how to use it here:
https://firebase.google.com/docs/database/web/read-and-write

For homework, week 7, UCLA coding boot camp

## TODO: 
 * update score on win, not on new game
 * 2 different chat classes not working
 * when a player disconnects, notify and put game back into waiting for player 2 mode

## Planned for the future
 * when someone is watching, show the game going live
 * (optional) let player choose hand color -  look at this: https://codepen.io/designerJordan/pen/qDEjr
 * (optional) integrate network with your SET game!


## Overview
In this assignment, you'll indeed create another Rock Paper Scissors game. The catch? You're going to make this an online multiplayer game, all with the help of Firebase (and the rest of your web development repertoire)!

## Remember
You will be fully capable of doing this homework by the end of Saturday's class.
Some Notes Before you begin

Whether you finish the game or not, you must hand in your code by Thursday, Nov 10th to avoid having your work marked incomplete. We don't expect every student to finish this assignment. Still, we do want to see you program this game as best you can.

## When Should You Be an Expert with the Concepts from This Homework?
By Week 9. Try your absolute best to finish this homework. Remember: you have two weeks to ace this exercise.

## Setup
* Create a GitHub repo called RPS-Multiplayer and clone it to your computer.
* Create a file inside of your RPS-Multiplayer folder called index.html. This is where your page's HTML will go.
* Don't forget to include jQuery and Firebase.
* Inside RPS-Multiplayer, create your assets directory.
* Create the folders and files you typically place in assets -- just like you had for the prior weeks' homework assignments.

## Instructions
Create a game that suits this user story:
* Only two users can play at the same time.
* Both players pick either rock, paper or scissors. After the players make their selection, the game will tell them whether a tie occurred or if one player defeated the other.
* The game will track each player's wins and losses.
* Throw some chat functionality in there! No online multiplayer game is complete without having to endure endless taunts and insults from your jerk opponent.
* Styling and theme are completely up to you. Get Creative!

## Additional Practice and Support
* If you find your skills lacking in any of the subjects we taught you, look at your instructor's in class repository.
* Find the exercises that you did in class and redo them from scratch. It might seem redundant at first, but this will help edify the material.
* You can also watch videos of this all of our past lectures--we've saved these to the repo.
* Like always, feel free to contact either your instructor or a TA if you'd like some one-on-one support.

* Refer to snapshot methods like `exists()`, `child()`, and `numChildren`
https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot

* and the CodersBay solution from Wed/Thurs, showing usage:
https://uclax.bootcampcontent.com/UCLA-Coding-Boot-Camp/09-16-Class-Content/tree/master/0919-MW/07-firebase/1-Class-Content/7.2/Activities/06-codersbay/SOLVED

* READ THE FIREBASE docs