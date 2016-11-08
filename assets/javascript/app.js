//global variables
var players = ["dummy"];
var game = {
	playersConnected : 0,
	watchersConnected : 0,
	chatHistory : []
};
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
	
	// update local data when database changes
	database.ref("players").on("value", function(snapshot){
		players = snapshot.val();
		displayPlayers();
	}, function(error){
		console.error(error);
	});

	$("button.play").click(function(){
		makeMove($(this).data("move"), myPlayer);
	});
	$("#result").on("click", "#new-game-button", 	newGame);
	$("button.set-name").click(function(){
		if (players.length < 4){
			// don't add a new player if there are already 2
			myPlayer = players.length;
			opponent = 3 - myPlayer;
			var newName = $(this).prev("input.player-name").val();
			players.push({
				name : newName,
				wins : 0,
				losses : 0,
				currentMove : false
			});
			console.log("myPlayer: " + myPlayer + ", opponent: " + opponent);
			saveGameToStorage();
		}
	});
	//empty input when you click on it
	$("input.player-name").on("focus", function(){
		$(this).val("");
	});
	newGame();
}
function makeMove(move, playerID){
	if (!players[playerID].currentMove && players[playerID].name){
		// prevent someone from making multiple moves in a game
		// you have to set your name before you can make a move
		players[playerID].currentMove = move;
		saveGameToStorage();
		//hide buttons until next move
		$("section#player"+(playerID)).find("div.buttons").hide();

		if (players[opponent].currentMove){
			// both players have made moves
			var winner = testMoves(move, players[opponent].currentMove);
			displayWinner(winner);
		}
	}
	
}
function displayPlayers(){
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
			//show opponent's move
			if (players[opponent].currentMove){
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + players[opponent].currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);
			} else {
				section.find(".move").html("");
			}

		} else {
			section.find(".move").html("");
		}
	}
	//display opponent
	if (players[opponent]){
		console.log(players[opponent]);
		section = $("#player2");
		section.find(".name").text(players[opponent].name);
	}
}
function testMoves(moveZero, moveOne){
	// more concise way to see who wins
	// moves in ascending value of power:
	var moves = ["paper", "scissors", "rock"];
	var move0 = moves.indexOf(moveZero);
	var move1 = moves.indexOf(moveOne);

	// test the difference between the moves' values:
	switch (move0 - move1){
		case 0:
			// the moves are the same
			return "tie";
		case 1:
			//if a move is one larger, it wins
			return 0;
		case -1:
			return 1;
		case 2:
			// 2 means rock v paper, paper wins
			return 1;
		case -2:
			// neg 2 means paper v rock, paper wins
			return 0;
	}
}
function displayWinner(winnerID){
	if (winnerID === "tie"){
		$("#result #display").text("Tie!");
	} else {
		$("#result #display").text(players[winnerID].name + " wins!");
		players[winnerID].wins++;
		var otherPlayer = (winnerID+1) % 2;
		players[otherPlayer].losses++;
	}
	saveGameToStorage();
	var newGameButton = $("<button>");
	newGameButton
		.text("Play Again")
		.attr("id", "new-game-button");
	$("#result #display").append(newGameButton);
}
function newGame(){
	for (var i = 0; i < players.length; i++) {
		players[i].currentMove = false;
		//show buttons
		$("section#player"+(i+1)).find("div.buttons").show();
	}
	$("#result #display").empty();
	saveGameToStorage();

}
function saveGameToStorage(){
	database.ref("players").set(players);
}


$(document).ready(initGame);