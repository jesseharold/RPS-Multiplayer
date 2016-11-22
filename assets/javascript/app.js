//global variables
var database;
var myPlayer;
var myKey = "";
var opponent;
var opponentKey = "";
var chatLog;
var role = "watcher";

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
	connectedRef.on('child_added', function(snapshot) {
		if (snapshot.val() === true) {
			// add this player to my connections list
			database.ref("players").once("value")
			.then(function(playersSnapshot) {
				var numberOfPlayers = playersSnapshot.numChildren();
				var newPlayer = createPlayer(numberOfPlayers);
				newPlayer.timeJoined = Date.now();
				var con = database.ref('players').push(newPlayer);

				// when I disconnect, remove this player
				con.onDisconnect().remove();

				// remember the key for my player
				myKey = con.key;
			});
		}
	});

	
// **** Event Listeners *****

	// update local data when database changes
	
	// watch for updates to myPlayer
	database.ref("players/"+myKey).on("value", function(snapshot){
		if (myKey){
			myPlayer = snapshot.child(myKey).val();
			if (myPlayer.name){
				role = "player";
				displayMyPlayer();
			}
		}
	}, function(error){
		console.error("Can't get player data: " + error);
	});

	database.ref("players").on("child_removed", function(snapshot) {
		//check to see if your opponent disconnected
		//if so, check for a watcher to add to the game
	});
	
	// watch for updates to other players
	database.ref("players").orderByChild("timeJoined").on("child_added", function(snapshot){
		$("#watchers .data").text(snapshot.numChildren());
		/*
		if (myKey && !opponent && snapshot.numChildren() > 1){
			// add opponent if we already have a player
			// AND opponent already doesn't exist 
			// and there's another person connected who has entered their name
			snapshot.forEach(function(childSnapshot) {
				if(childSnapshot.key !== myKey && childSnapshot.val().name){
					//console.log("adding opponent" + childSnapshot.val().name);
					opponent = childSnapshot.val();
					opponentKey = childSnapshot.key;				
					displayOpponent();
					return true;
					// exit the forEach once we have an opponent
				}
			});
		} else if (opponentKey && opponent && opponent.name){
			//console.log("detected an update to " + opponent.name);
			opponent = snapshot.child(opponentKey).val();
			displayOpponent();
		}
		if(opponent && opponent.name && myPlayer && myPlayer.name){
			gameIsFull = true;
		} else {
			gameIsFull = false;
		}
		database.ref("gameFull").set(gameIsFull);
		testGame();
		*/
	}, function(error){
		console.error("Can't get opponent data: " + error);
	});

	// watch for new chats
	database.ref("chatLog").orderByChild("timestamp").on("value", function(snapshot){
		displayChats(snapshot.val());
	}, function(error){
		console.error("Can't get chatLog data: " + error);
	});

	// watch for game getting full
	database.ref("gameFull").on("value", function(snapshot){
		gameIsFull = snapshot.val();
	});

	
	// click events
	$("button.play").click(function(){
		makeMove($(this).data("move"), myPlayer);
	});
	$("#result").on("click", "#new-game-button", checkForNewGame);

	$("button.set-name").click(function(){
		if(!gameIsFull){
			myPlayer.name = ($(this).prev("input.player-name").val());
			myPlayer.ready = true;
			saveMyPlayerToDB();
		} else {
			alert("Sorry, someone's already playing, try again later");
		}
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
function createPlayer(playerId){
	myPlayer = {
		name : "",
		id : playerId,
		wins : 0,
		losses : 0,
		currentMove : false,
		ready : false
	};
	return myPlayer;
}
function displayMyPlayer(){
	//console.log("displayMyPlayer: " + myPlayer.name);
	if(myPlayer && myPlayer.name){
		// show name and score, if it exists
		var section = $("#player1");
		section.find(".name").text(myPlayer.name);
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
		//if(!scoreUpdated){
			//scoreUpdated = true;
			var winner = testMoves(opponent.currentMove, myPlayer.currentMove);
			if (winner === true){
				myPlayer.wins++;
			} else if (winner === false){
				myPlayer.losses++;
			}
		//}
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