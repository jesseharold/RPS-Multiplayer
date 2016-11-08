//global variables
var players = [
	{
		chatHistory : [{anon:"first Chat"}]
	}
	];
var database;
var myPlayer;
var opponent;
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
		players = snapshot.val();
		displayGame();
	}, function(error){
		console.error(error);
	});

	$("button.play").click(function(){
		makeMove($(this).data("move"), myPlayer);
	});
	$("#result").on("click", "#new-game-button", newGame);

	$("button.set-name").click(function(){
		createPlayer($(this).prev("input.player-name").val());
	});

	$("button#send-chat").click(function(){
		sendChat($(this).prev("input").val().trim());
		$(this).prev("input").val("");
	});

	//empty input when you click on it
	$("input").on("focus", function(){
		$(this).val("");
	});

	newGame();
}
function createPlayer(newName){
	if (players.length <= 3){
		// don't add a new player if there are already 2
		myPlayer = players.length;
		opponent = 3 - myPlayer;
		players.push({
			name : newName,
			wins : 0,
			losses : 0,
			currentMove : false,
			ready : true
		});
		saveGameToDB();
	}
}
function sendChat(msg){
	var chatter = "anon";
	var chatOwner = false;
	if (players[myPlayer]){
		chatter = players[myPlayer].name;
		chatOwner = myPlayer;
	}
	players[0].chatHistory.push({name:chatter, message:msg, owner:chatOwner});
	saveGameToDB();
}
function makeMove(move, playerID){
	if (!players[playerID].currentMove && players.length === 3){
		// prevent someone from making multiple moves in a game
		// you can't make a move unless both players are present
		players[playerID].currentMove = move;
		saveGameToDB();
		//hide buttons until next move
		$("section#player1").find("div.buttons").hide();
	}
	
}
function displayGame(){
	//display current player
	if(myPlayer){
		var section = $("#player1");
		section.find(".name").text(players[myPlayer].name);
		var scoreText = "Wins: " + players[myPlayer].wins + ", Losses: " + players[myPlayer].losses;
		section.find(".score").text(scoreText);
		if (players[myPlayer].currentMove){
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + players[myPlayer].currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);
		} else {
			section.find(".move").html("");
			$("section#player1").find("div.buttons").show();
		}
	}
	//display opponent
	if (players[opponent]){
		section = $("#player2");
		if (players[opponent].name){
			section.find(".name").text(players[opponent].name);
		}
		if (players[opponent].currentMove && players[myPlayer].currentMove){
				var handImage = $("<img>");
				handImage
					.attr("src", "assets/images/" + players[opponent].currentMove + ".png")
					.addClass("hand-image");
				section.find(".move").html(handImage);
		} else {
			section.find(".move").html("");
		}
		//check if both moves have been taken
		if (players[opponent].currentMove && players[myPlayer].currentMove){
			// both players have made moves
			var winner = testMoves(players[opponent].currentMove, players[myPlayer].currentMove);
			displayWinner(winner);
		}
	}
	//display buttons if both players are present 
	if(players[opponent] && players[myPlayer]){
		if (players[opponent].ready && players[myPlayer].ready){
			$("button.play").show();
		}
	}

	//display Chat
	$("#chat-history").empty();
	for(var i = 1; i < players[0].chatHistory.length; i++){
		var div = $("<div>").addClass("chat-message");
		if (players[0].chatHistory[i].owner){
			div.addClass("chat-message-" + players[0].chatHistory[i].owner)
		}
		var txt = '<span class="chatter">' + players[0].chatHistory[i].name + ": </span>";
		txt += players[0].chatHistory[i].message;
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
	//console.log(didIwin);
	if (didIwin === "tie"){
		$("#result #display").text("Tie!");
	} else {
		var winner;
		if (didIwin){
			winner = players[myPlayer];
		} else {
			winner = players[opponent];
		}
		$("#result #display").text(winner.name + " wins!");
		winner.wins++;
		players[opponent].losses++;
	}
	//saveGameToDB();
	players[myPlayer].ready = false;
	var newGameButton = $("<button>");
	newGameButton
		.text("Play Again")
		.attr("id", "new-game-button");
	$("#result").show().find("#display").append(newGameButton);
}
function newGame(){
	if(players[myPlayer]){
		players[myPlayer].currentMove = false;
		players[myPlayer].ready = true;
	}
	$("section#player1").find("div.buttons").show();
	$("#result #display").empty();
	$("#result").hide();
	saveGameToDB();
}
function saveGameToDB(){
	database.ref("players").set(players);
}


$(document).ready(initGame);