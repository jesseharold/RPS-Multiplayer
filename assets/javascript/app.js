//global variables
var database;
var myPlayer;
var myKey = "";
var opponent;
var opponentKey = "";
var chatLog;
var iWon;

// settings

function initGame(){
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDpkXfloYmdVW9IyEoyfTrAE07OmBKNf8U",
		authDomain: "testing-3cc34.firebaseapp.com",
		databaseURL: "https://testing-3cc34.firebaseio.com",
		storageBucket: "testing-3cc34.appspot.com",
		messagingSenderId: "222650091540"
	};
  	firebase.initializeApp(config);
	// get a reference to the database
	database = firebase.database();

// Manage presence
	var connectedRef = database.ref('.info/connected');
	connectedRef.on('value', function(snapshot) {
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
			displayMyPlayer();
		}
	}, function(error){
		console.error("Can't get player data: " + error);
	});

	// watch for updates to other players
	database.ref("players").on("child_added", function(snapshot){
		if (myKey){
			// only add opponent if we already have a player
			// if opponent already doesn't exist and there's another player, create opponent
			if(!opponent){
				console.log("adding opponent");
				opponent = snapshot.val();
				opponentKey = snapshot.key;				
				displayOpponent();
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
		myPlayer.name = ($(this).prev("input.player-name").val());
		saveMyPlayerToDB();
	});

	$("button#send-chat").click(function(){
		sendChat($(this).prev("input").val().trim());
		$(this).prev("input").val("");
	});

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
		ready : true
	};
	return myPlayer;
}
function displayMyPlayer(){
	console.log("displayMyPlayer: " + myPlayer.name);
	if(myPlayer && myPlayer.name){
		// show name and score, if it exists
		var section = $("#player1");
		section.find(".name").text(myPlayer.name);
		var scoreText = "Wins: " + myPlayer.wins + ", Losses: " + myPlayer.losses;
		section.find(".score").text(scoreText);

		// show image for move, if it exists
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
	}
}
function displayOpponent(){
	console.log("displayOpponent: " + opponent.name);
	if (opponent && myPlayer){
		// show name, if it exists
		section = $("#player2");
		if (opponent.name){
			section.find(".name").text(opponent.name);
		}
		// show move buttons if both players are ready
		if (opponent.ready && myPlayer.ready){
			$("#player1 .buttons").show();
			$("#result #display").empty();
			$("#result").hide();
		}
		// show image for move, if it exists AND if I have already made my move
		if (opponent.currentMove && myPlayer.currentMove){
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + opponent.currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);

			var winner = testMoves(opponent.currentMove, myPlayer.currentMove);
			displayWinner(winner);
		} else {
			// remove last image for move
			section.find(".move").html("");
		}
	}
}
function makeMove(move, playerID){
	if (myPlayer.currentMove && opponent){
		// prevent someone from making multiple moves in a round
		// you can't make a move unless both players are present
		myPlayer.currentMove = move;
		myPlayer.ready = false;
		//hide buttons until next move
		$("section#player1").find("div.buttons").hide();
		saveMyPlayerToDB();
	}
}
function testMoves(myMove, theirMove){
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
	//set the global variable to save to DB
	iWon = didIwin;
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
	if (iWon === true){
		myPlayer.wins++;
	} else if (iWon === false){
		myPlayer.losses++;
	}
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
		chatOwner = "user-" + myPlayer.id;
	}
	var timeStamp = new Date();
	database.ref("chatLog").push({name:chatter, message:msg, owner:chatOwner, timestamp:timeStamp});
}
function displayChats(snapshot){
	$("#chat-history").empty();
	for (var key in snapshot) {
		var chat = snapshot[key];
		var div = $("<div>").addClass("chat-message");
		if (chat.owner){
			div.addClass("chat-message-" + chat.owner)
		}
		var txt = '<span class="chatter">' + chat.name + ": </span>";
		txt += chat.message;
		div.html(txt);
		$("#chat-history").prepend(div);	
	}
}



$(document).ready(initGame);