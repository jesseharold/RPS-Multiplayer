//global variables
var database;
var myPlayer;
var myKey = "";
var opponent;
var opponentKey = "";
var chatLog;
var gameIsFull = false;
var role = false;
var localCopyPlayers;

// settings

function initGame(){
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDhjIqd5KuZxaKuA0aPx91P2ihd88bBOMw",
		authDomain: "rock-paper-scissors2.firebaseapp.com",
		databaseURL: "https://rock-paper-scissors2.firebaseio.com",
		storageBucket: "rock-paper-scissors2.appspot.com",
		messagingSenderId: "249441131797"
	};
	firebase.initializeApp(config);

	// get a reference to the database
	database = firebase.database();

// Manage presence
	var connectedRef = database.ref('.info/connected');
	connectedRef.on('value', function(snapshot) {
		if (snapshot.val() === true) {
			// add this person to my connections list
			database.ref("present").once("value")
			.then(function(presentSnapshot) {
				myPlayer = createPlayer();
				var con = database.ref("present").push(myPlayer);
				myKey = con.key;
				myPlayer.id = myKey;
				$("#watchers .data").text(presentSnapshot.numChildren() + 1);
				// when I disconnect, remove this player
				con.onDisconnect().remove();
				// remember the key for my player
			});
		}
	});

	
// **** Event Listeners *****

	// watch for disconnections
	database.ref("present").on("child_removed", function(snapshot) {
		//console.log("player disconnected");
		if (snapshot.key === opponentKey){
			// Your opponent left the game
			removePlayer(opponentKey);
		}
	});

	// watch for updates to players
	database.ref("players").on("value", function(snapshot){
		var numPlayers =snapshot.numChildren();
		//console.log("There are now " + numPlayers + " players.");
		localCopyPlayers = snapshot.val();
		if (numPlayers === 1){
			// waiting for a second player
			gameIsFull = false;
			if (!myPlayer.ready){
				// second player already waiting
				for (var key in localCopyPlayers){
					if(localCopyPlayers[key].name){
						opponent = localCopyPlayers[key];
						displayPlayer2isWaiting();
					}
				}
			} else {
				//check to see if opponent is gone
				// you are waiting for second player
				displayWaitingforPlayer2();
			}
		}  else if (numPlayers >= 2){
			// ready to play game
			gameIsFull = true;
			if(myPlayer.name){
				localCopyPlayers = snapshot.val();
				for (var key in localCopyPlayers){
					if (localCopyPlayers[key].id === myKey){
						//set local myPlayer to db copy
						myPlayer = localCopyPlayers[key];
					} else {
						//set local opponent to other player in db
						opponent = localCopyPlayers[key];
						opponentKey = key;
					}
				}
				displayOpponent();
				displayMyPlayer();
			} else {
				//no name means you're a watcher
				displayFullGame();
			}
		}
	}, function(error){
		console.error("Can't get opponent data: " + error);
	});

	// watch for new chats
	database.ref("chatLog").orderByChild("timestamp").on("value", function(snapshot){
		displayChats(snapshot.val());
	}, function(error){
		console.error("Can't get chatLog data: " + error);
	});

	
	// click events
	$("button.play").click(function(){
		makeMove($(this).data("move"), myPlayer);
	});
	$("#result").on("click", "#new-game-button", checkForNewGame);

	$("button.set-name").click(function(){
		joinGame();
	});

	$("button#send-chat").click(function(){
		sendChat($(this).prev("input").val().trim());
		$(this).prev("input").val("");
	});
	
	$("button#clear-chat").click(clearChat);

	//empty name input when you click on it
	$("input").on("focus", function(){
		$(this).val("");
	});

	// make chat send on enter keypress
	$("input#chat-box").on("focus", function(){
		$("body").on("keypress", function(event){
			if (event.charCode === 13) {
				// if enter key is pressed
				$("button#send-chat").trigger("click");
			}
		});
	}).on("focusout", function(){
		$("body").off("keypress");
	});

	newGame();
}
function createPlayer(){
	newPlayer = {
		name : "",
		wins : 0,
		losses : 0,
		currentMove : false,
		ready : false,
		timeJoined : Date.now()
	};
	return newPlayer;
}
function removePlayer(removeId){
	// find member of players with id that matches the argument
	// and delete it
	database.ref("players").once("value")
		.then(function(snapshot) {
			var players = snapshot.val();
			for (var playerKey in players){
				if (players[playerKey].id === removeId){
					database.ref("players/" + playerKey).remove();
				}
			}
		});
}
function joinGame(){
	if(!gameIsFull){
		myPlayer.name = $("#player1").find("input.player-name").val();
		myPlayer.ready = true;
		// show name and hide name input
		$("#player1 .name").text(myPlayer.name);
		saveMyPlayerToDB();
	} else {
		alert("Sorry, someone's already playing, try again later");
	}
}
function displayMyPlayer(){
	//console.log("displayMyPlayer: " + myPlayer.name);
	if(myPlayer && myPlayer.name){
		// show score
		var section = $("#player1");
		var scoreText = "Wins: " + myPlayer.wins + ", Losses: " + myPlayer.losses;
		section.find(".score").text(scoreText);

		// show image for my move, if it exists
		if (myPlayer.currentMove){
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + myPlayer.currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);
		} else {
			// clear previous image of move
			section.find(".move").html("");
		}		
		displayBoard();
	}
}
function displayWaitingforPlayer2(){
	$("#player2 .name").text("Waiting for Player 2 to join.");
}
function displayPlayer2isWaiting(){
	$("#player2 .name").text(opponent.name + " is waiting for you to join.");
}
function displayFullGame(){
	// need to work on this some more
	$("#player1 .name").text("This game is full.");
}
function displayOpponent(){
	//console.log("displayOpponent: " + opponent.name);
	if (opponent && myPlayer){
		// show name, if it exists
		section = $("#player2");
		if (opponent.name){
			section.find(".name").text(opponent.name);
		}
		// show image for opponent's move, if it exists AND if I have already made my move
		section = $("#player2");
		if (opponent.currentMove && myPlayer.currentMove){
		//console.log(myPlayer.currentMove + ", " + opponent.currentMove);
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + opponent.currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);
		} else {
			// remove last image for move
			section.find(".move").html("");
		}
	}
	displayBoard();
}
function displayBoard(){
	// show move buttons if both players are ready
	if (opponent && myPlayer && opponent.ready && myPlayer.ready){
		$("#player1 .buttons").show();
		$("#result #display").empty();
		$("#result").hide();
	}
	testGame();
}

function makeMove(move){
	//console.log("making Move");
	if (myPlayer && myPlayer.ready && opponent && opponent.name){
		// prevent someone from making multiple moves in a round
		// you can't make a move unless both players are present
		myPlayer.currentMove = move;
		myPlayer.ready = false;
		//hide buttons until next move
		$("section#player1").find("div.buttons").hide();
		saveMyPlayerToDB();
	}
}
function testGame(){
	//if all moves have been made, see who won and update score
	if (myPlayer && myPlayer.currentMove && opponent && opponent.currentMove){
		var winner = testMoves(myPlayer.currentMove, opponent.currentMove);
		if (winner === true){
			myPlayer.wins++;
		} else if (winner === false){
			myPlayer.losses++;
		}
		displayWinner(winner);
	}
}
function testMoves(myMove, theirMove){
	//console.log("testMoves()");
	// more concise way to see who wins
	// moves in ascending value of power:
	var moves = ["paper", "scissors", "rock"];
	var mine = moves.indexOf(myMove);
	var theirs = moves.indexOf(theirMove);
	// test the difference between the moves' values:
	switch (mine - theirs){
		case 0:
			// the moves are the same
			return "tie";
		case 1:
			//if a move is one larger, it wins
			return false;
		case -1:
			return true;
		case 2:
			// 2 means rock v paper, paper wins
			return true;
		case -2:
			// neg 2 means paper v rock, paper wins
			return false;
	}
}
function displayWinner(didIwin){
	//console.log("displayWinner() " + didIwin);
	if (didIwin === "tie"){
		$("#result #display").text("Tie!");
	} else {
		var winner;
		if (didIwin){
			winner = myPlayer.name;
		} else {
			winner = opponent.name;
		}
		$("#result #display").text(winner + " wins!");
	}
	var newGameButton = $("<button>");
	newGameButton
		.text("Play Again")
		.attr("id", "new-game-button");
	$("#result").show().find("#display").append(newGameButton);
}
function checkForNewGame(){
	// get my player ready for next round and wait for other player
	myPlayer.currentMove = false;
	myPlayer.ready = true;
	saveMyPlayerToDB();
	if(opponent.ready){
		newGame();
	} else {
		$("#result #display").text("waiting for all players...");
	}
}
function newGame(){
	$("#result #display").empty();
	$("#result").hide();
	scoreUpdated = false;
}
function saveMyPlayerToDB(){
	if(myPlayer){
		var ref = database.ref("players/"+myKey).set(myPlayer);
	}
}
function sendChat(msg){
	// default values
	var chatter = "anon";
	var chatOwner = false;
	if (myPlayer && myPlayer.name){
		chatter = myPlayer.name;
		chatOwner = myKey;
	}
	var timeStamp = new Date();
	database.ref("chatLog").push({name:chatter, message:msg, owner:chatOwner, timestamp:timeStamp});
}
function displayChats(snapshot){
	$("#chat-history").empty();
	for (var key in snapshot) {
		var chat = snapshot[key];
		var div = $("<div>").addClass("chat-message");
		if (chat.owner === myKey){
			div.addClass("chat-message-self");
		} else if (chat.owner === opponentKey){
			div.addClass("chat-message-opponent");
		} 
		var txt = '<span class="chatter">' + chat.name + ": </span>";
		txt += chat.message;
		div.html(txt);
		$("#chat-history").prepend(div);	
	}
}
function clearChat(){
	database.ref("chatLog").remove();
}



$(document).ready(initGame);