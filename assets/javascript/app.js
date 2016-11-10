//global variables
var database;
var myPlayer;
var opponent;
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
	
// **** Event Listeners *****

	// update local data when database changes
	database.ref("players").on("value", function(snapshot){
		//opponent = snapshot.child().val();
		//displayOpponent();
	}, function(error){
		console.error("Can't get opponent data: " + error);
	});
	/*
	database.ref("players").on("value", function(snapshot){
		//myPlayer = snapshot.val();
		//displayMyPlayer();
		console.log("players updated in DB");
	}, function(error){
		console.error("Can't get myPlayer data: " + error);
	});
	*/
	database.ref("chatLog").on("value", function(snapshot){
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
		createPlayer($(this).prev("input.player-name").val());
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
function createPlayer(newName){
	var numberOfPlayers = 1;
	var ref = firebase.database().ref("players");
	ref.once("value")
	.then(function(snapshot) {
		numberOfPlayers = snapshot.numChildren();
		myPlayer = {
			name : newName,
			id : numberOfPlayers,
			wins : 0,
			losses : 0,
			currentMove : false,
			ready : true
		};
		database.ref("players").push(myPlayer);
	});
}
function sendChat(msg){
	// default values
	var chatter = "anon";
	var chatOwner = false;
	if (myPlayer && myPlayer.name){
		chatter = myPlayer.name;
		chatOwner = myPlayer.id;
	}
	database.ref("chatLog").push({name:chatter, message:msg, owner:chatOwner});
}
function makeMove(move, playerID){
	if (myPlayer.currentMove && opponent){
		// prevent someone from making multiple moves in a round
		// you can't make a move unless both players are present
		myPlayer.currentMove = move;
		myPlayer.ready = false;
		//hide buttons until next move
		$("section#player1").find("div.buttons").hide();
		saveGameToDB();
	}
}
function displayMyPlayer(){
	if(myPlayer){
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
	saveGameToDB();
	if(opponent.ready){
		newGame();
	} else {
		$("#result #display").text("waiting for all players...");
	}
}
function newGame(){
	$("#result #display").empty();
	$("#result").hide();
	saveGameToDB();
}
function saveGameToDB(){
	console.log("saved");
	//database.ref("gameData").set(gameData);
}



$(document).ready(initGame);